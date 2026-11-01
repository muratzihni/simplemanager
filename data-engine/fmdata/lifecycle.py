"""Oyuncu yaşam döngüsü: emeklilik ve alt yapıdan regen çıkışı.

Saf fonksiyonlar; rastgelelik dışarıdan verilen `random.Random` ile gelir,
bu yüzden aynı tohum aynı sonucu verir ve testler kesindir.
Sayısal eşikler ayarlanabilir başlangıç değerleridir, gerçek veri değildir.
"""
from __future__ import annotations

import datetime as dt
import random
from dataclasses import dataclass
from typing import Callable, Optional

# Mevkiye göre yaş eğrisi: (emeklilik ihtimalinin başladığı yaş, kesin bırakma yaşı)
RETIRE_AGES = {"GK": (36, 44), "DEF": (34, 40), "MID": (33, 39), "ATT": (32, 38)}
POS_GROUP = {
    "Kaleci": "GK", "Stoper": "DEF", "Sağ bek": "DEF", "Sol bek": "DEF",
    "Ön libero": "MID", "Merkez orta saha": "MID", "Ofansif orta saha": "MID",
    "Sağ kanat": "ATT", "Sol kanat": "ATT", "Santrfor": "ATT",
}


def age_on(birth: dt.date, on: dt.date) -> int:
    return on.year - birth.year - ((on.month, on.day) < (birth.month, birth.day))


@dataclass
class RetirementDecision:
    retire: bool
    reason: str = ""          # Yaş | Sakatlık | Kendi isteği
    national_retire: bool = False


def retire_probability(age: int, position: str, reputation: int, serious_injuries: int = 0,
                       has_club: bool = True) -> float:
    """Yıllık emeklilik ihtimali (0..1). Yüksek itibarlı oyuncu daha uzun oynar."""
    start, hard = RETIRE_AGES[POS_GROUP.get(position, "MID")]
    start += (max(1, min(20, reputation)) - 10) // 5   # itibar -2..+2 yıl kaydırır
    hard += (max(1, min(20, reputation)) - 10) // 5
    if age >= hard:
        return 1.0
    if age < start:
        p = 0.0
    else:
        p = (age - start + 1) / (hard - start + 1)
    p += 0.08 * min(serious_injuries, 3) if age >= start - 3 else 0.0
    if not has_club and age >= start:
        p += 0.25   # kulübü yoksa daha çabuk bırakır
    return max(0.0, min(1.0, p))


def decide_retirement(birth: dt.date, position: str, reputation: int, on: dt.date, rng: random.Random,
                      serious_injuries: int = 0, has_club: bool = True,
                      international: bool = False, national_caps: int = 0) -> RetirementDecision:
    """Sezon sonunda bir kez çağrılır."""
    age = age_on(birth, on)
    p = retire_probability(age, position, reputation, serious_injuries, has_club)
    retire = rng.random() < p
    reason = ""
    if retire:
        start, _ = RETIRE_AGES[POS_GROUP.get(position, "MID")]
        reason = "Sakatlık" if serious_injuries >= 2 and age < start else ("Yaş" if age >= start else "Kendi isteği")
    # Milli takım: kulüp kariyeri sürse de bırakabilir (30+), emekli olan zaten bırakır.
    nat = False
    if international:
        if retire:
            nat = True
        elif age >= 31:
            nat = rng.random() < min(0.9, 0.12 * (age - 30) + (0.1 if national_caps >= 80 else 0))
    return RetirementDecision(retire, reason, nat)


# ---------------- Regen ----------------

@dataclass(frozen=True)
class CountryRegen:
    date: str          # "gg.aa"
    per_club: int      # kulüp başına yıllık ortalama
    quality: int       # 1..20
    age: int = 16


def parse_day_month(s: str) -> tuple[int, int]:
    d, m = s.strip().split(".")[:2]
    d, m = int(d), int(m)
    dt.date(2001, m, d)  # geçersizse ValueError
    return d, m


def regen_due(cfg: CountryRegen, on: dt.date) -> bool:
    d, m = parse_day_month(cfg.date)
    return (on.day, on.month) == (d, m)


def regen_count(cfg: CountryRegen, youth_facility: int, rng: random.Random) -> int:
    """Alt yapı tesisi 1..20: 1 → ortalamanın ~%25'i, 10 → ortalama, 20 → ~2 katı. Tamsayıya olasılıkla yuvarlanır."""
    f = max(1, min(20, youth_facility))
    mult = 0.25 + 0.75 * (f - 1) / 9 if f <= 10 else 1.0 + (f - 10) / 10
    x = cfg.per_club * mult
    n = int(x)
    if rng.random() < x - n:
        n += 1
    return n


def regen_quality(cfg: CountryRegen, youth_facility: int, rng: random.Random) -> int:
    """Doğan oyuncunun itibar/potansiyel düzeyi (1..20): ülke kalitesi + tesis etkisi + gürültü."""
    base = cfg.quality * 0.6 + max(1, min(20, youth_facility)) * 0.4
    return max(1, min(20, round(base + rng.gauss(0, 1.8))))


@dataclass
class Regen:
    name: str
    birth: dt.date
    nationality: str
    club: str
    quality: int


def generate_regens(country: str, cfg: CountryRegen, clubs: list[tuple[str, int]], on: dt.date,
                    rng: random.Random, name_pool: Callable[[str, random.Random], str]) -> list[Regen]:
    """clubs: (kulüp adı, alt yapı tesisi). Tarih gelmediyse boş döner.
    name_pool(country, rng) isim verir; isim havuzları ayrı veridir ve ülke başına sağlanmalıdır."""
    if not regen_due(cfg, on):
        return []
    out: list[Regen] = []
    for club, fac in clubs:
        for _ in range(regen_count(cfg, fac, rng)):
            by = on.year - cfg.age
            birth = dt.date(by, rng.randint(1, 12), rng.randint(1, 28))
            out.append(Regen(name_pool(country, rng), birth, country, club, regen_quality(cfg, fac, rng)))
    return out


# ---------------- Emeklilik sonrası plan, geçmiş yılları, saha içi olaylar ----------------
import re as _re

POST_CAREER = ["Teknik direktör", "Yardımcı antrenör", "Altyapı antrenörü", "Kulüp yöneticisi", "Kulüp başkanı",
               "Scout (yetenek avcısı)", "Menajer", "TV yorumcusu", "İş insanı", "Futboldan uzaklaşır"]


def post_career_outcome(plan: str, backup: str, leadership: int, reputation: int, rng: random.Random) -> str:
    """Emekli olunca seçilen plan tutar mı? Tutmazsa yedek plan denenir; o da tutmazsa 'Futboldan uzaklaşır'.
    Teknik direktörlük için liderlik ve itibar, diğer roller için itibar belirleyicidir."""
    def works(role: str) -> bool:
        if role == "Futboldan uzaklaşır":
            return True
        base = {"Teknik direktör": 0.25 + 0.02 * leadership, "Kulüp başkanı": 0.05 + 0.02 * reputation,
                "TV yorumcusu": 0.2 + 0.03 * reputation}.get(role, 0.45 + 0.01 * reputation)
        return rng.random() < min(0.95, base)
    for role in (plan, backup):
        if role in POST_CAREER and works(role):
            return role
    return "Futboldan uzaklaşır"


_STINT = _re.compile(r"^\s*(\d{4})\s*[–-]\s*(\d{4})?\s*·\s*([^·]+?)\s*(?:\([^)]*\))?\s*·")


def years_by(text: str, today_year: int, club_country: dict[str, str]) -> tuple[dict[str, int], dict[str, int]]:
    """Kariyer geçmişi satırlarından kulüp ve ülke başına toplam yıl. Bitişi boş satır 'hâlâ orada' sayılır."""
    clubs: dict[str, int] = {}
    countries: dict[str, int] = {}
    for ln in (text or "").splitlines():
        m = _STINT.match(ln)
        if not m:
            continue
        a, b, name = int(m.group(1)), int(m.group(2)) if m.group(2) else today_year, m.group(3).strip()
        yrs = max(0, b - a)
        clubs[name] = clubs.get(name, 0) + yrs
        c = club_country.get(name, "Bilinmiyor")
        countries[c] = countries.get(c, 0) + yrs
    return clubs, countries


def position_fit(scores: dict[str, int], position: str) -> float:
    """Mevki skoru 1..20 → oynarken verim çarpanı 0.5..1.0."""
    s = max(1, min(20, scores.get(position, 1)))
    return 0.5 + 0.5 * (s - 1) / 19


def incident_events(ratings: dict[str, int], minutes: int, rng: random.Random, provoked: bool = False) -> list[str]:
    """90 dakikalık maçta saha içi olaylar. ratings: dvOlay, dvKufur, dvKavga, dvHakem, dvKasitli, dvTahrik,
    dvSeyirci, dvKart, dvSakin (hepsi 1..20). Olasılıklar maç başınadır ve ayarlanabilir başlangıç değerleridir."""
    calm = ratings.get("dvSakin", 10) / 20.0
    scale = (minutes / 90.0) * (1.4 if provoked else 1.0) * (1.3 - 0.6 * calm)
    table = [("dvKufur", "Küfür etti", 0.20), ("dvHakem", "Hakeme itiraz etti", 0.30), ("dvKasitli", "Kasıtlı faul yaptı", 0.25),
             ("dvTahrik", "Rakibi tahrik etti", 0.20), ("dvSeyirci", "Seyirciyle tartıştı", 0.10), ("dvKavga", "Rakip oyuncuya saldırdı", 0.06)]
    out = []
    gate = ratings.get("dvOlay", 5) / 20.0
    for key, text, p in table:
        prob = p * (ratings.get(key, 5) / 20.0) * (0.5 + gate) * scale
        if rng.random() < prob:
            out.append(text)
    return out
