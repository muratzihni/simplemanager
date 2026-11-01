"""Sağlayıcı adaptör arayüzü. Yeni bir veri kaynağı eklemek = bu sınıfı uygulamak."""
from __future__ import annotations

from typing import Optional

from ..models import PClub, PCoach, PInjury, PLeague, PPlayer, PSuspension, PTransfer


class NotSupported(Exception):
    """Sağlayıcı bu veri türünü sunmuyor; içe aktarıcı bunu 'eksik veri' olarak işler (uydurmaz)."""


class Provider:
    code: str = ""
    name: str = ""
    base_url: str = ""
    license_note: str = ""
    allows_redistribution: Optional[bool] = None       # None = doğrulanmadı
    capabilities: frozenset = frozenset()               # leagues clubs squads coach transfers injuries suspensions
    VERIFIED_AGAINST_LIVE_API = False                   # canlı API ile doğrulanana kadar False kalır

    def leagues(self) -> list[PLeague]:
        raise NotSupported("leagues")

    def clubs(self, league_ref: str, season_year: int) -> list[PClub]:
        raise NotSupported("clubs")

    def squad(self, club_ref: str, season_year: int) -> list[PPlayer]:
        raise NotSupported("squads")

    def coach(self, club_ref: str) -> Optional[PCoach]:
        raise NotSupported("coach")

    def transfers(self, club_ref: str) -> list[PTransfer]:
        raise NotSupported("transfers")

    def injuries(self, league_ref: str, season_year: int) -> list[PInjury]:
        raise NotSupported("injuries")

    def suspensions(self, league_ref: str, season_year: int) -> list[PSuspension]:
        raise NotSupported("suspensions")
