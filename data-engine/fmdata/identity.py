"""Ad normalizasyonu ve oyuncu kimlik eşleştirme: aynı oyuncu için ikinci kayıt açılmaz."""
from __future__ import annotations

import difflib
import json
import re
import sqlite3
import unicodedata

from .db import utcnow
from .models import PPlayer, normalize_position

_SPECIAL = str.maketrans({"ı": "i", "İ": "i", "ß": "ss", "ø": "o", "Ø": "o", "đ": "d", "Đ": "d", "ł": "l", "Ł": "l",
                          "æ": "ae", "Æ": "ae", "œ": "oe", "Œ": "oe", "þ": "th", "ð": "d"})
_PARTICLES = {"de", "da", "do", "dos", "das", "van", "von", "der", "den", "di", "del", "la", "le", "el", "al", "bin", "ibn", "jr", "sr"}

MATCH_THRESHOLD = 0.86       # aynı doğum tarihi + bu benzerlik = aynı oyuncu
CONFLICT_THRESHOLD = 0.60    # arası belirsiz: yeni kayıt açılır ama 'conflict' işaretlenir


def normalize_name(s: str) -> str:
    s = (s or "").translate(_SPECIAL)
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-zA-Z0-9\s]", " ", s).lower()
    return " ".join(s.split())


def name_tokens(s: str) -> list[str]:
    return sorted(t for t in normalize_name(s).split() if t not in _PARTICLES)


def name_similarity(a: str, b: str) -> float:
    ta, tb = name_tokens(a), name_tokens(b)
    if not ta or not tb:
        return 0.0
    if ta == tb:
        return 1.0
    sa, sb = set(ta), set(tb)
    # "Gundogan" ile "Ilkay Gundogan": tek jetonlu ad, diğerinin içinde geçiyorsa güçlü eşleşme
    if (len(sa) == 1 and sa <= sb) or (len(sb) == 1 and sb <= sa):
        return 0.9
    seq = difflib.SequenceMatcher(None, " ".join(ta), " ".join(tb)).ratio()
    jac = len(sa & sb) / len(sa | sb)
    return max(seq, jac)


class MatchResult:
    def __init__(self, player_id: int, created: bool, conflict_with: int | None = None, reason: str = ""):
        self.player_id, self.created, self.conflict_with, self.reason = player_id, created, conflict_with, reason


def find_or_create_player(conn: sqlite3.Connection, source_id: int, p: PPlayer, job_id: int | None,
                          log_error) -> MatchResult:
    now = utcnow()
    row = conn.execute("SELECT entity_id FROM external_ids WHERE entity_type='player' AND source_id=? AND external_id=?",
                       (source_id, p.ref)).fetchone()
    if row:
        conn.execute("UPDATE external_ids SET last_seen_at=? WHERE entity_type='player' AND source_id=? AND external_id=?",
                     (now, source_id, p.ref))
        return MatchResult(row[0], False, reason="external_id")

    norm = normalize_name(p.full_name)
    candidates = []
    if p.birth_date:
        candidates = conn.execute("SELECT id, full_name, nationality FROM players WHERE birth_date = ?", (p.birth_date,)).fetchall()
    else:
        tok = " ".join(name_tokens(p.full_name))
        candidates = [r for r in conn.execute("SELECT id, full_name, nationality FROM players").fetchall()
                      if " ".join(name_tokens(r["full_name"])) == tok] if tok else []

    best, best_sim = None, 0.0
    for c in candidates:
        sim = name_similarity(p.full_name, c["full_name"])
        if p.birth_date is None and p.nationality and c["nationality"] and p.nationality != c["nationality"]:
            continue
        if sim > best_sim:
            best, best_sim = c, sim

    if best is not None and best_sim >= MATCH_THRESHOLD and (p.birth_date or len(candidates) == 1):
        _link_external(conn, "player", best["id"], source_id, p.ref, now)
        _add_alias(conn, best["id"], p.full_name)
        return MatchResult(best["id"], False, reason=f"ad+doğum tarihi eşleşmesi ({best_sim:.2f})")

    status = "provider_reported"
    conflict_with = None
    if best is not None and best_sim >= CONFLICT_THRESHOLD:
        status, conflict_with = "conflict", best["id"]
    elif not p.birth_date:
        status = "unverified"

    cur = conn.execute(
        "INSERT INTO players(first_name,last_name,full_name,normalized_name,birth_date,nationality,second_nationality,height_cm,weight_kg,"
        "preferred_foot,primary_position,alt_positions,source_id,verification_status,confidence,last_checked_at,created_at) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (p.first_name, p.last_name, p.full_name, norm, p.birth_date, p.nationality, p.second_nationality, p.height_cm, p.weight_kg,
         p.preferred_foot, normalize_position(p.position), json.dumps(p.alt_positions) if p.alt_positions else None,
         source_id, status, 0.6 if status == "conflict" else (0.5 if status == "unverified" else 0.8), now, now))
    pid = cur.lastrowid
    _link_external(conn, "player", pid, source_id, p.ref, now)
    _add_alias(conn, pid, p.full_name)
    if conflict_with:
        log_error("conflict", "player", p.ref,
                  f"'{p.full_name}' mevcut oyuncu #{conflict_with} ile aynı doğum tarihinde ve benzer adlı (benzerlik {best_sim:.2f}); elle inceleyin")
    elif not p.birth_date:
        log_error("warning", "player", p.ref, f"'{p.full_name}' için doğum tarihi yok; kimlik eşleşmesi doğrulanamadı")
    return MatchResult(pid, True, conflict_with, "yeni kayıt")


def _link_external(conn, entity_type, entity_id, source_id, ext, now):
    conn.execute(
        "INSERT INTO external_ids(entity_type,entity_id,source_id,external_id,first_seen_at,last_seen_at) VALUES (?,?,?,?,?,?) "
        "ON CONFLICT(entity_type,source_id,external_id) DO UPDATE SET last_seen_at=excluded.last_seen_at",
        (entity_type, entity_id, source_id, ext, now, now))


def _add_alias(conn, player_id, alias):
    n = normalize_name(alias)
    if n:
        conn.execute("INSERT OR IGNORE INTO player_identities(player_id,alias,normalized_alias,kind) VALUES (?,?,?, 'full')",
                     (player_id, alias, n))
