"""Sağlayıcıdan bağımsız kayıt türleri. None = kaynakta yok (uydurulmaz)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PLeague:
    ref: str
    name: str
    country: Optional[str] = None
    country_code: Optional[str] = None
    kind: str = "league"                 # league | cup | other
    seasons: dict = field(default_factory=dict)   # '2026' -> {'start': 'YYYY-MM-DD', 'end': ...}


@dataclass
class PPlayer:
    ref: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[str] = None
    nationality: Optional[str] = None
    second_nationality: Optional[str] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    preferred_foot: Optional[str] = None
    position: Optional[str] = None
    alt_positions: list = field(default_factory=list)
    shirt_number: Optional[int] = None
    contract_start: Optional[str] = None
    contract_end: Optional[str] = None


@dataclass
class PCoach:
    ref: Optional[str]
    full_name: str
    birth_date: Optional[str] = None
    nationality: Optional[str] = None
    contract_start: Optional[str] = None
    contract_end: Optional[str] = None


@dataclass
class PClub:
    ref: str
    name: str
    short_name: Optional[str] = None
    tla: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    founded_year: Optional[int] = None
    stadium_name: Optional[str] = None
    stadium_capacity: Optional[int] = None
    squad: Optional[list] = None          # list[PPlayer] ya da None (bu çağrıda getirilmedi)
    coach: Optional[PCoach] = None


@dataclass
class PTransfer:
    player_ref: str
    player_name: Optional[str]
    date: str
    kind: str                              # permanent | loan | loan_return | free | contract_expiry | unknown
    from_club_ref: Optional[str] = None
    from_club_name: Optional[str] = None
    to_club_ref: Optional[str] = None
    to_club_name: Optional[str] = None
    fee_text: Optional[str] = None


@dataclass
class PInjury:
    player_ref: str
    player_name: Optional[str]
    club_ref: Optional[str]
    injury_type: str
    start_date: str
    expected_return_date: Optional[str] = None
    is_ongoing: bool = True
    missing_fixture: Optional[bool] = None


@dataclass
class PSuspension:
    player_ref: str
    player_name: Optional[str]
    club_ref: Optional[str]
    reason: str                            # red_card | second_yellow | yellow_accumulation | disciplinary | unknown
    start_date: str
    end_date: Optional[str] = None
    matches_total: Optional[int] = None
    matches_remaining: Optional[int] = None
    competition_ref: Optional[str] = None
    organization: Optional[str] = None


CANONICAL_POSITIONS = {
    "goalkeeper": "GK", "keeper": "GK", "gk": "GK", "g": "GK",
    "defence": "DEF", "defender": "DEF", "defense": "DEF", "d": "DEF",
    "centre-back": "CB", "center-back": "CB", "left-back": "LB", "right-back": "RB",
    "midfield": "MID", "midfielder": "MID", "m": "MID",
    "defensive midfield": "DM", "central midfield": "CM", "attacking midfield": "AM",
    "left midfield": "LM", "right midfield": "RM",
    "offence": "FWD", "attacker": "FWD", "forward": "FWD", "f": "FWD",
    "left winger": "LW", "right winger": "RW", "centre-forward": "ST", "center-forward": "ST", "second striker": "SS",
}


def normalize_position(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return CANONICAL_POSITIONS.get(raw.strip().lower(), raw.strip())
