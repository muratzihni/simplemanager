"""Milli takım uygunluğu, temsilci pazarlığı ve sözleşme primi hesapları (saf fonksiyonlar).

Milli takım kuralı FIFA'nın genel çizgisine göre sadeleştirilmiştir (ayrıntılar ayarlanabilir):
- Gençlik (U-kademeleri) ve hazırlık maçları bağlamaz.
- Resmî bir A milli müsabakada oynayan oyuncu kilitlenir; istisna: 21 yaşından önce, toplam
  3'ten az resmî A maç ve son maçından 3 yıl geçmiş ise başka uygun ülkeye geçebilir.
Bu sürüm bir model yaklaşımıdır, hukuki metin değildir.
"""
from __future__ import annotations

import datetime as dt
from dataclasses import dataclass, field


@dataclass
class NationalRecord:
    official_a_caps: int = 0            # resmî A milli maç sayısı (hazırlık hariç)
    first_official_age: int | None = None
    last_official_date: dt.date | None = None
    youth_nations: list[str] = field(default_factory=list)


def can_switch(rec: NationalRecord, on: dt.date, eligible_new: bool) -> bool:
    """Başka bir milli takıma geçebilir mi? eligible_new: yeni ülkeye vatandaşlık/soy bağı var mı."""
    if not eligible_new:
        return False
    if rec.official_a_caps == 0:
        return True   # gençlik takımı seçimi bağlamaz
    if rec.official_a_caps < 3 and (rec.first_official_age or 99) < 21 and rec.last_official_date:
        return (on - rec.last_official_date).days >= 3 * 365
    return False


def eligible_nations(citizenships: list[str]) -> list[str]:
    seen, out = set(), []
    for c in citizenships:
        c = (c or "").strip()
        if c and c not in seen:
            seen.add(c); out.append(c)
    return out


def agent_demand_multiplier(agent_hardness: int) -> float:
    """Temsilci sertliği 1..20 → maaş/prim talebi çarpanı (1.0 ila 1.5). Temsilcisiz = 1.0."""
    h = max(1, min(20, agent_hardness))
    return 1.0 + 0.5 * (h - 1) / 19


def agent_fee(agent_commission_pct: float, transfer_fee: float, annual_wage: float) -> float:
    return (agent_commission_pct / 100.0) * (transfer_fee + annual_wage)


def match_bonus(contract: dict, *, started: bool, result: str, goals: int = 0, assists: int = 0,
                clean_sheet: bool = False, defender_or_keeper: bool = False) -> int:
    """Bir maç sonrası ödenecek prim. result: W/D/L. Alan adları editördeki sözleşme bonus anahtarlarıdır."""
    total = contract.get("macPrim", 0)
    if started:
        total += contract.get("ilk11", 0)
    total += {"W": contract.get("galibiyet", 0), "D": contract.get("beraberlik", 0)}.get(result, 0)
    total += goals * contract.get("golPrim", 0) + assists * contract.get("asistPrim", 0)
    if clean_sheet and defender_or_keeper:
        total += contract.get("csPrim", 0)
    return int(total)


def season_end_bonus(contract: dict, *, league_title=False, champions_league=False, european=False,
                     avoided_relegation=False, promoted=False, cup_won=False, top_scorer=False,
                     player_of_year=False, called_up=False, appearances=0) -> int:
    t = 0
    t += contract.get("sampiyonPrim", 0) if league_title else 0
    t += contract.get("slPrim", 0) if champions_league else 0
    t += contract.get("avrPrim", 0) if european else 0
    t += contract.get("kumePrim", 0) if avoided_relegation else 0
    t += contract.get("yukselPrim", 0) if promoted else 0
    t += contract.get("kupaPrim", 0) if cup_won else 0
    t += contract.get("golKrali", 0) if top_scorer else 0
    t += contract.get("sezonOyuncu", 0) if player_of_year else 0
    t += contract.get("milliCagri", 0) if called_up else 0
    if contract.get("sureMac") and appearances >= contract["sureMac"]:
        t += contract.get("surePrim", 0)
    t += contract.get("sadakat", 0)
    return int(t)


def wage_after_relegation(wage: float, contract: dict) -> float:
    return wage * (1 - contract.get("dususKesinti", 0) / 100.0)


def parse_tournament_bonus(text: str) -> list[tuple[str, str, int]]:
    """Her satır 'Turnuva · koşul · tutar'. Bozuk satırlar ValueError verir."""
    out = []
    for ln in (text or "").splitlines():
        ln = ln.strip()
        if not ln:
            continue
        parts = [p.strip() for p in ln.split("·")]
        if len(parts) != 3:
            raise ValueError("Satır 'Turnuva · koşul · tutar' biçiminde olmalı: %r" % ln)
        out.append((parts[0], parts[1], int(parts[2].replace(".", "").replace(",", ""))))
    return out


def parse_opponent_stats(text: str) -> dict[str, tuple[int, int]]:
    """'Rakip · maç · gol' satırları → {rakip: (maç, gol)}; aynı rakip tekrar ederse toplanır."""
    res: dict[str, tuple[int, int]] = {}
    for ln in (text or "").splitlines():
        ln = ln.strip()
        if not ln:
            continue
        p = [x.strip() for x in ln.split("·")]
        if len(p) != 3:
            raise ValueError("Satır 'Rakip · maç · gol' biçiminde olmalı: %r" % ln)
        m, g = res.get(p[0], (0, 0))
        res[p[0]] = (m + int(p[1]), g + int(p[2]))
    return res
