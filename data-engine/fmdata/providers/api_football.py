"""API-Football (api-sports.io) v3 adaptörü.

DURUM: Belgelenmiş yanıt biçimine göre yazıldı; canlı API ile DOĞRULANMADI (anahtar ve ağ erişimi yoktu).
Özellikle şunlar canlı yanıtla doğrulanmalıdır: transfer 'type' değerleri ('Loan', 'Back from loan', 'Free', 'N/A', ücret metni),
/injuries içindeki 'reason' değerleri (ceza göstergesi olarak kullanılıyor), sayfalama alanları, hız sınırı başlıkları.
"""
from __future__ import annotations

import os
import re
from typing import Optional

from ..http_client import HttpClient, RateLimit, SqliteCache
from ..models import PClub, PCoach, PInjury, PLeague, PPlayer, PSuspension, PTransfer, normalize_position
from .base import Provider

_ISO = re.compile(r"^\d{4}-\d{2}-\d{2}")


def _day(v) -> Optional[str]:
    return v[:10] if isinstance(v, str) and _ISO.match(v) else None


def _num(v, unit: str) -> Optional[int]:
    if isinstance(v, (int, float)):
        return int(v)
    m = re.match(rf"^\s*(\d+)\s*{unit}\s*$", v or "", re.I)
    return int(m.group(1)) if m else None


def parse_leagues(body: dict) -> list[PLeague]:
    out = []
    for r in (body or {}).get("response", []):
        lg = r.get("league") or {}
        if lg.get("id") is None or not lg.get("name"):
            continue
        ct = r.get("country") or {}
        seasons = {str(s["year"]): {"start": _day(s.get("start")), "end": _day(s.get("end"))} for s in r.get("seasons", []) if s.get("year")}
        out.append(PLeague(ref=str(lg["id"]), name=lg["name"], country=ct.get("name"), country_code=ct.get("code"),
                           kind="cup" if (lg.get("type") or "").lower() == "cup" else "league", seasons=seasons))
    return out


def parse_teams(body: dict) -> list[PClub]:
    out = []
    for r in (body or {}).get("response", []):
        t, v = r.get("team") or {}, r.get("venue") or {}
        if t.get("id") is None or not t.get("name"):
            continue
        out.append(PClub(ref=str(t["id"]), name=t["name"], tla=t.get("code"), country=t.get("country"), city=v.get("city"),
                         founded_year=t.get("founded"), stadium_name=v.get("name"), stadium_capacity=v.get("capacity") or None))
    return out


def parse_players(body: dict) -> list[PPlayer]:
    out = []
    for r in (body or {}).get("response", []):
        p = r.get("player") or {}
        if p.get("id") is None:
            continue
        first, last = p.get("firstname"), p.get("lastname")
        full = " ".join(x for x in (first, last) if x) or p.get("name")
        if not full:
            continue
        stats = (r.get("statistics") or [{}])[0] if r.get("statistics") else {}
        games = stats.get("games") or {}
        out.append(PPlayer(ref=str(p["id"]), full_name=full, first_name=first, last_name=last,
                           birth_date=_day((p.get("birth") or {}).get("date")), nationality=p.get("nationality"),
                           height_cm=_num(p.get("height"), "cm"), weight_kg=_num(p.get("weight"), "kg"),
                           position=normalize_position(games.get("position")), shirt_number=games.get("number")))
    return out


def parse_squad_numbers(body: dict) -> dict[str, dict]:
    res = {}
    for r in (body or {}).get("response", []):
        for p in r.get("players", []):
            if p.get("id") is not None:
                res[str(p["id"])] = {"number": p.get("number"), "position": normalize_position(p.get("position")), "name": p.get("name")}
    return res


def classify_transfer(type_text: Optional[str]) -> tuple[str, Optional[str]]:
    t = (type_text or "").strip()
    low = t.lower()
    if "back from loan" in low or "loan return" in low or "return from loan" in low:
        return "loan_return", None
    if low == "loan" or low.startswith("loan"):
        return "loan", None
    if low == "free" or low == "free transfer":
        return "free", None
    if low in ("", "n/a", "-"):
        return "unknown", None
    return "permanent", t     # ücret metni (ör. '€ 70M')


def parse_transfers(body: dict) -> list[PTransfer]:
    out = []
    for r in (body or {}).get("response", []):
        pl = r.get("player") or {}
        if pl.get("id") is None:
            continue
        for tr in r.get("transfers", []):
            d = _day(tr.get("date"))
            if not d:
                continue
            kind, fee = classify_transfer(tr.get("type"))
            teams = tr.get("teams") or {}
            tin, tout = teams.get("in") or {}, teams.get("out") or {}
            out.append(PTransfer(player_ref=str(pl["id"]), player_name=pl.get("name"), date=d, kind=kind,
                                 from_club_ref=str(tout["id"]) if tout.get("id") else None, from_club_name=tout.get("name"),
                                 to_club_ref=str(tin["id"]) if tin.get("id") else None, to_club_name=tin.get("name"),
                                 fee_text=fee if fee else (tr.get("type") if kind in ("unknown",) else None)))
    return out


def _suspension_reason(reason: str) -> Optional[str]:
    low = (reason or "").lower()
    if "red card" in low:
        return "red_card"
    if "yellow" in low:
        return "yellow_accumulation"
    if "suspen" in low:
        return "disciplinary"
    return None


def parse_injuries(body: dict) -> tuple[list[PInjury], list[PSuspension]]:
    inj, sus = [], []
    for r in (body or {}).get("response", []):
        p, t, f = r.get("player") or {}, r.get("team") or {}, r.get("fixture") or {}
        d = _day(f.get("date"))
        if p.get("id") is None or not d:
            continue
        reason = p.get("reason") or ""
        s_reason = _suspension_reason(reason)
        club_ref = str(t["id"]) if t.get("id") else None
        if s_reason:
            sus.append(PSuspension(player_ref=str(p["id"]), player_name=p.get("name"), club_ref=club_ref, reason=s_reason, start_date=d))
        else:
            inj.append(PInjury(player_ref=str(p["id"]), player_name=p.get("name"), club_ref=club_ref, injury_type=reason or "unspecified",
                               start_date=d, expected_return_date=None, is_ongoing=True,
                               missing_fixture=(p.get("type") or "").lower() == "missing fixture"))
    return inj, sus


def parse_coachs(body: dict, team_ref: str) -> Optional[PCoach]:
    best = None
    for r in (body or {}).get("response", []):
        if not r.get("name"):
            continue
        for c in r.get("career", []) or []:
            if str((c.get("team") or {}).get("id")) == str(team_ref) and not c.get("end"):
                best = PCoach(ref=str(r.get("id")) if r.get("id") else None, full_name=r["name"], birth_date=_day((r.get("birth") or {}).get("date")),
                              nationality=r.get("nationality"), contract_start=_day(c.get("start")))
    return best


class ApiFootball(Provider):
    code = "api-football"
    name = "API-Football v3 (api-sports.io)"
    base_url = "https://v3.football.api-sports.io"
    license_note = "Ticari kullanım ve yeniden dağıtım hakları sağlayıcı şartlarından doğrulanmalı; ücretsiz plan geliştirme/test amaçlıdır."
    capabilities = frozenset({"leagues", "clubs", "squads", "coach", "transfers", "injuries", "suspensions"})
    TTL = {"leagues": 7 * 86400, "clubs": 12 * 3600, "squad": 6 * 3600, "transfers": 3 * 3600, "injuries": 3 * 3600}

    def __init__(self, http: HttpClient):
        self.http = http

    @classmethod
    def from_env(cls, cache_path: str = ":memory:", per_minute: int = 10, per_day: int | None = 100) -> "ApiFootball":
        key = os.environ.get("FMDATA_API_FOOTBALL_KEY")
        if not key:
            raise RuntimeError("FMDATA_API_FOOTBALL_KEY ortam değişkeni tanımlı değil")
        return cls(HttpClient(cls.base_url, headers={"x-apisports-key": key, "Accept": "application/json"},
                              rate=RateLimit(per_minute=per_minute, per_day=per_day), cache=SqliteCache(cache_path)))

    def _check_errors(self, body):
        err = (body or {}).get("errors")
        if err:
            msg = "; ".join(f"{k}: {v}" for k, v in err.items()) if isinstance(err, dict) else str(err)
            if msg.strip():
                raise RuntimeError(f"API-Football hata döndürdü: {msg}")
        return body

    def leagues(self) -> list[PLeague]:
        return parse_leagues(self._check_errors(self.http.get_json("leagues", ttl=self.TTL["leagues"])))

    def clubs(self, league_ref: str, season_year: int) -> list[PClub]:
        return parse_teams(self._check_errors(self.http.get_json("teams", {"league": league_ref, "season": season_year}, ttl=self.TTL["clubs"])))

    def squad(self, club_ref: str, season_year: int) -> list[PPlayer]:
        players: list[PPlayer] = []
        for body in self.http.paginate("players", {"team": club_ref, "season": season_year},
                                       total_pages=lambda b: (b.get("paging") or {}).get("total", 1), ttl=self.TTL["squad"]):
            players.extend(parse_players(self._check_errors(body)))
        numbers = parse_squad_numbers(self._check_errors(self.http.get_json("players/squads", {"team": club_ref}, ttl=self.TTL["squad"])))
        for p in players:
            n = numbers.get(p.ref)
            if n:
                p.shirt_number = n["number"] if n["number"] is not None else p.shirt_number
                p.position = p.position or n["position"]
        return players

    def coach(self, club_ref: str) -> Optional[PCoach]:
        return parse_coachs(self._check_errors(self.http.get_json("coachs", {"team": club_ref}, ttl=self.TTL["clubs"])), club_ref)

    def transfers(self, club_ref: str) -> list[PTransfer]:
        return parse_transfers(self._check_errors(self.http.get_json("transfers", {"team": club_ref}, ttl=self.TTL["transfers"])))

    def injuries(self, league_ref: str, season_year: int) -> list[PInjury]:
        return parse_injuries(self._check_errors(self.http.get_json("injuries", {"league": league_ref, "season": season_year}, ttl=self.TTL["injuries"])))[0]

    def suspensions(self, league_ref: str, season_year: int) -> list[PSuspension]:
        return parse_injuries(self._check_errors(self.http.get_json("injuries", {"league": league_ref, "season": season_year}, ttl=self.TTL["injuries"])))[1]
