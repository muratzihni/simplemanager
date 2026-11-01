"""football-data.org v4 adaptörü.

DURUM: Belgelenmiş yanıt biçimine göre yazıldı; canlı API ile DOĞRULANMADI (anahtar ve ağ erişimi yoktu).
Kapsam (belgelere göre): yarışmalar, takımlar (stadyum, kuruluş yılı), kadro (ad, mevki, doğum tarihi, uyruk), teknik direktör.
Bu sağlayıcıda sakatlık, ceza ve transfer verisi YOKTUR; adaptör bunlar için NotSupported döndürür.
"""
from __future__ import annotations

import os
import re
from typing import Optional

from ..http_client import HttpClient, RateLimit, SqliteCache
from ..models import PClub, PCoach, PLeague, PPlayer, normalize_position
from .base import NotSupported, Provider

_DATE = re.compile(r"^\d{4}-\d{2}(-\d{2})?$")


def _date(v) -> Optional[str]:
    return v if isinstance(v, str) and _DATE.match(v) else None


def parse_competitions(body: dict) -> list[PLeague]:
    out = []
    for c in (body or {}).get("competitions", []):
        if c.get("id") is None or not c.get("name"):
            continue
        area = c.get("area") or {}
        kind = {"LEAGUE": "league", "CUP": "cup"}.get((c.get("type") or "").upper(), "other")
        seasons = {}
        cs = c.get("currentSeason") or {}
        if cs.get("startDate"):
            seasons[cs["startDate"][:4]] = {"start": _date(cs.get("startDate")), "end": _date(cs.get("endDate"))}
        out.append(PLeague(ref=str(c.get("code") or c["id"]), name=c["name"], country=area.get("name"),
                           country_code=area.get("code"), kind=kind, seasons=seasons))
    return out


def parse_teams(body: dict) -> list[PClub]:
    out = []
    for t in (body or {}).get("teams", []):
        if t.get("id") is None or not t.get("name"):
            continue
        squad = None
        if isinstance(t.get("squad"), list):
            squad = [PPlayer(ref=str(p["id"]), full_name=p["name"], birth_date=_date(p.get("dateOfBirth")),
                             nationality=p.get("nationality"), position=normalize_position(p.get("position")))
                     for p in t["squad"] if p.get("id") is not None and p.get("name")]
        coach = None
        c = t.get("coach")
        if isinstance(c, dict) and c.get("name"):
            ct = c.get("contract") or {}
            coach = PCoach(ref=str(c["id"]) if c.get("id") else None, full_name=c["name"], birth_date=_date(c.get("dateOfBirth")),
                           nationality=c.get("nationality"), contract_start=_date(ct.get("start")), contract_end=_date(ct.get("until")))
        out.append(PClub(ref=str(t["id"]), name=t["name"], short_name=t.get("shortName"), tla=t.get("tla"),
                         country=(t.get("area") or {}).get("name"), founded_year=t.get("founded"),
                         stadium_name=t.get("venue"), squad=squad, coach=coach))
    return out


class FootballDataOrg(Provider):
    code = "football-data.org"
    name = "football-data.org v4"
    base_url = "https://api.football-data.org/v4"
    license_note = "Kullanım koşulları ve ticari/yeniden dağıtım hakları doğrulanmadı; planına göre değişir."
    capabilities = frozenset({"leagues", "clubs", "squads", "coach"})
    TTL = {"leagues": 7 * 86400, "clubs": 6 * 3600}

    def __init__(self, http: HttpClient):
        self.http = http

    @classmethod
    def from_env(cls, cache_path: str = ":memory:", per_minute: int = 10) -> "FootballDataOrg":
        token = os.environ.get("FMDATA_FOOTBALL_DATA_ORG_TOKEN")
        if not token:
            raise RuntimeError("FMDATA_FOOTBALL_DATA_ORG_TOKEN ortam değişkeni tanımlı değil")
        return cls(HttpClient(cls.base_url, headers={"X-Auth-Token": token, "Accept": "application/json"},
                              rate=RateLimit(per_minute=per_minute), cache=SqliteCache(cache_path)))

    def leagues(self) -> list[PLeague]:
        return parse_competitions(self.http.get_json("competitions", ttl=self.TTL["leagues"]))

    def clubs(self, league_ref: str, season_year: int) -> list[PClub]:
        body = self.http.get_json(f"competitions/{league_ref}/teams", {"season": season_year}, ttl=self.TTL["clubs"])
        return parse_teams(body)

    def squad(self, club_ref: str, season_year: int) -> list[PPlayer]:
        body = self.http.get_json(f"teams/{club_ref}", ttl=self.TTL["clubs"])
        clubs = parse_teams({"teams": [body]})
        return clubs[0].squad or [] if clubs else []

    def coach(self, club_ref: str) -> Optional[PCoach]:
        body = self.http.get_json(f"teams/{club_ref}", ttl=self.TTL["clubs"])
        clubs = parse_teams({"teams": [body]})
        return clubs[0].coach if clubs else None
