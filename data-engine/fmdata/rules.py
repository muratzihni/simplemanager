"""Maç uygunluğu (sakatlık + ceza) ve oyun içi disiplin simülasyonu."""
from __future__ import annotations

import sqlite3

from .db import utcnow


def availability(conn: sqlite3.Connection, player_id: int, on_date: str, competition_id: int | None = None) -> dict:
    """'available' | 'doubtful' | 'unavailable'.

    Tahmini dönüş tarihi KESİN dönüş sayılmaz: tarih geçse bile dönüş onaylanmadıysa 'doubtful' döner.
    Süresi bilinmeyen ceza da 'doubtful' sayılır (uydurma süre kullanılmaz).
    """
    reasons: list[dict] = []
    level = "available"

    def raise_to(new: str):
        nonlocal level
        order = {"available": 0, "doubtful": 1, "unavailable": 2}
        if order[new] > order[level]:
            level = new

    for r in conn.execute(
        "SELECT * FROM player_injuries WHERE player_id=? AND start_date<=? "
        "AND ((is_ongoing=1 AND actual_return_date IS NULL) OR actual_return_date>?)", (player_id, on_date, on_date)):
        exp = r["expected_return_date"]
        if exp and on_date >= exp:
            raise_to("doubtful")
            reasons.append({"kind": "injury", "type": r["injury_type"], "detail": "tahmini dönüş tarihi geçti, dönüş onaylanmadı"})
        else:
            raise_to("unavailable")
            reasons.append({"kind": "injury", "type": r["injury_type"], "expected_return_estimate": exp})
    for s in conn.execute("SELECT * FROM player_suspensions WHERE player_id=? AND start_date<=?", (player_id, on_date)):
        if competition_id is not None and s["competition_id"] is not None and s["competition_id"] != competition_id:
            continue
        rem, end = s["matches_remaining"], s["end_date"]
        if rem is not None:
            if rem > 0:
                raise_to("unavailable")
                reasons.append({"kind": "suspension", "reason": s["reason"], "matches_remaining": rem, "origin": s["origin"]})
        elif end is not None:
            if end >= on_date:
                raise_to("unavailable")
                reasons.append({"kind": "suspension", "reason": s["reason"], "end_date": end, "origin": s["origin"]})
        else:
            raise_to("doubtful")
            reasons.append({"kind": "suspension", "reason": s["reason"], "detail": "süre bilinmiyor", "origin": s["origin"]})
    return {"player_id": player_id, "date": on_date, "status": level, "can_play": level == "available", "reasons": reasons}


def game_suspension_for(rule: dict, *, yellow_cards: int = 0, red: bool = False, second_yellow: bool = False) -> dict | None:
    """Oyun içi simülasyon kuralı. Gerçek dünya cezası ÜRETMEZ; yalnızca oyun motorunun kendi cezasını hesaplar."""
    if red:
        return {"reason": "red_card", "matches": rule["red_ban_matches"]}
    if second_yellow:
        return {"reason": "second_yellow", "matches": rule["second_yellow_ban_matches"]}
    th = rule.get("yellow_threshold")
    if th and yellow_cards > 0 and yellow_cards % th == 0:
        return {"reason": "yellow_accumulation", "matches": rule["yellow_ban_matches"]}
    return None


def rule_for(conn, *, competition_key: str | None, organization: str | None, country_key: str | None) -> dict | None:
    """En özelden en genele: turnuva > organizasyon > ülke."""
    for st, key in (("competition", competition_key), ("organization", organization), ("country", country_key)):
        if key:
            r = conn.execute("SELECT * FROM discipline_rules WHERE scope_type=? AND scope_key=?", (st, key)).fetchone()
            if r:
                return dict(r)
    return None


def record_game_suspension(conn, player_id: int, competition_id: int | None, on_date: str, s: dict) -> int:
    cur = conn.execute(
        "INSERT OR IGNORE INTO player_suspensions(player_id,competition_id,reason,start_date,matches_total,matches_remaining,origin,verification_status,last_checked_at) "
        "VALUES (?,?,?,?,?,?,'game_simulated','verified',?)",
        (player_id, competition_id, s["reason"], on_date, s["matches"], s["matches"], utcnow()))
    return cur.lastrowid
