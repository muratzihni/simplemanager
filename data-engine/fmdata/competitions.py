"""Kıtasal kupa puanı (kulüp katsayısı), milli takım dünya/kıta puanı ve lig değiş tokuşu.

Formüller UEFA/FIFA'nın genel mantığına benzeyen sadeleştirmelerdir; resmî hesaplama değildir.
"""
from __future__ import annotations

from dataclasses import dataclass

SEASONS_WINDOW = 5


def club_coefficient(season_points: list[float]) -> float:
    """Son 5 sezonun toplamı; 5'ten uzun liste verilirse en yeni 5 sezon alınır (liste yeniden eskiye)."""
    return round(sum(season_points[:SEASONS_WINDOW]), 3)


def season_points(wins: int, draws: int, stage_bonus: float = 0.0, qualifying_wins: int = 0,
                  qualifying_draws: int = 0) -> float:
    """UEFA tarzı: galibiyet 2, beraberlik 1 puan; eleme turlarında yarısı; tur bonusu eklenir."""
    return round(wins * 2 + draws * 1 + qualifying_wins + qualifying_draws * 0.5 + stage_bonus, 3)


def association_coefficient(club_season_points: list[float], n_clubs: int) -> float:
    """Ülke katsayısı bir sezon için: katılan kulüplerin puan toplamı / kulüp sayısı."""
    if n_clubs <= 0:
        raise ValueError("n_clubs > 0 olmalı")
    return round(sum(club_season_points) / n_clubs, 3)


@dataclass
class Match:
    points_scored: int      # kazanan 3, beraberlik 1, mağlup 0 (penaltıda 2/1)
    importance: float       # hazırlık 5, eleme 25, kıta şampiyonası 35, Dünya Kupası 50 (FIFA benzeri K)
    opponent_rating: float
    own_rating: float


def national_rating_delta(m: Match) -> float:
    """Elo benzeri: beklenen sonuç = 1/(1+10^((rakip-kendi)/600)); delta = K × (gerçek-beklenen)."""
    expected = 1.0 / (1.0 + 10 ** ((m.opponent_rating - m.own_rating) / 600.0))
    actual = {3: 1.0, 2: 0.75, 1: 0.5, 0: 0.0}[m.points_scored] if m.points_scored in (0, 1, 2, 3) else 0.0
    return round(m.importance * (actual - expected), 3)


def rank(ratings: dict[str, float]) -> dict[str, int]:
    """Puana göre 1..N sıralama; eşitlikte ada göre (kararlı)."""
    order = sorted(ratings, key=lambda k: (-ratings[k], k))
    return {k: i + 1 for i, k in enumerate(order)}


def swap_leagues(a: dict, b: dict) -> tuple[dict, dict]:
    """İki kulübün ülke ve ligini değiş tokuş eder (kopyalar döner). Kulüp aynıysa hata."""
    if a["ad"] == b["ad"]:
        raise ValueError("Aynı kulüp kendisiyle değiş tokuş edilemez")
    a2, b2 = dict(a), dict(b)
    a2["ulke"], b2["ulke"] = b["ulke"], a["ulke"]
    a2["lig"], b2["lig"] = b["lig"], a["lig"]
    return a2, b2


def validate_participants(participants: list[str], known: set[str], expected: int | None = None) -> list[str]:
    """Turnuva katılımcı listesi hataları: tekrar, bilinmeyen takım, takım sayısı uyuşmazlığı."""
    errs = []
    seen = set()
    for p in participants:
        if p in seen:
            errs.append("Tekrar eden takım: %s" % p)
        seen.add(p)
        if p not in known:
            errs.append("Bilinmeyen takım: %s" % p)
    if expected is not None and participants and len(participants) != expected:
        errs.append("Takım sayısı %d, beklenen %d" % (len(participants), expected))
    return errs
