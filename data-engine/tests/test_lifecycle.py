import datetime as dt
import random
import unittest

from fmdata import lifecycle as L


class Retirement(unittest.TestCase):
    def test_young_never_retires(self):
        for pos in L.POS_GROUP:
            self.assertEqual(L.retire_probability(24, pos, 10), 0.0)

    def test_hard_age_always_retires(self):
        self.assertEqual(L.retire_probability(41, "Santrfor", 10), 1.0)
        self.assertEqual(L.retire_probability(45, "Kaleci", 10), 1.0)

    def test_keeper_plays_longer_than_striker(self):
        self.assertLess(L.retire_probability(36, "Kaleci", 10), L.retire_probability(36, "Santrfor", 10))

    def test_reputation_extends_career(self):
        self.assertLess(L.retire_probability(35, "Stoper", 20), L.retire_probability(35, "Stoper", 3))

    def test_no_club_raises_probability(self):
        self.assertGreater(L.retire_probability(34, "Santrfor", 10, has_club=False),
                           L.retire_probability(34, "Santrfor", 10, has_club=True))

    def test_deterministic_and_national(self):
        d = dt.date(1988, 5, 1); on = dt.date(2026, 6, 30)
        a = L.decide_retirement(d, "Santrfor", 10, on, random.Random(7), international=True)
        b = L.decide_retirement(d, "Santrfor", 10, on, random.Random(7), international=True)
        self.assertEqual(a, b)
        self.assertTrue(a.retire)             # 38 yaş forvet → eşik üstü (kesin)
        self.assertTrue(a.national_retire)    # emekli olan milli takımı da bırakır
        self.assertEqual(a.reason, "Yaş")

    def test_national_before_club(self):
        d = dt.date(1992, 1, 1); on = dt.date(2026, 6, 30)   # 34 yaş
        hits = sum(L.decide_retirement(d, "Kaleci", 10, on, random.Random(i), international=True, national_caps=90).national_retire for i in range(200))
        self.assertGreater(hits, 100)  # kaleci kulüpte sürer, milli takımı sık bırakır
        r = [L.decide_retirement(d, "Kaleci", 10, on, random.Random(i)).retire for i in range(200)]
        self.assertEqual(sum(r), 0)

    def test_age_on(self):
        self.assertEqual(L.age_on(dt.date(2000, 7, 1), dt.date(2026, 6, 30)), 25)
        self.assertEqual(L.age_on(dt.date(2000, 7, 1), dt.date(2026, 7, 1)), 26)


class Regen(unittest.TestCase):
    cfg = L.CountryRegen("01.07", 2, 12, 16)

    def test_due_only_on_country_date(self):
        self.assertTrue(L.regen_due(self.cfg, dt.date(2026, 7, 1)))
        self.assertFalse(L.regen_due(self.cfg, dt.date(2026, 7, 2)))
        self.assertTrue(L.regen_due(L.CountryRegen("01.01", 1, 5), dt.date(2027, 1, 1)))

    def test_bad_date_raises(self):
        with self.assertRaises(ValueError):
            L.regen_due(L.CountryRegen("31.02", 1, 5), dt.date(2026, 1, 1))

    def test_facility_scales_count(self):
        def total(f):
            return sum(L.regen_count(self.cfg, f, random.Random(i)) for i in range(400))
        self.assertLess(total(2), total(10))
        self.assertLess(total(10), total(20))
        self.assertAlmostEqual(total(10) / 400, 2.0, delta=0.25)

    def test_quality_in_range_and_tracks_facility(self):
        lo = [L.regen_quality(self.cfg, 1, random.Random(i)) for i in range(300)]
        hi = [L.regen_quality(self.cfg, 20, random.Random(i)) for i in range(300)]
        self.assertTrue(all(1 <= q <= 20 for q in lo + hi))
        self.assertLess(sum(lo), sum(hi))

    def test_generate_on_date_only(self):
        pool = lambda c, r: "Ad %d" % r.randint(1, 9999)
        clubs = [("A", 10), ("B", 20)]
        self.assertEqual(L.generate_regens("Türkiye", self.cfg, clubs, dt.date(2026, 3, 1), random.Random(1), pool), [])
        out = L.generate_regens("Türkiye", self.cfg, clubs, dt.date(2026, 7, 1), random.Random(1), pool)
        self.assertTrue(out)
        self.assertTrue(all(r.birth.year == 2010 and r.nationality == "Türkiye" for r in out))
        self.assertEqual(out, L.generate_regens("Türkiye", self.cfg, clubs, dt.date(2026, 7, 1), random.Random(1), pool))
        self.assertGreaterEqual(sum(r.club == "B" for r in out), sum(r.club == "A" for r in out) - 3)


if __name__ == "__main__":
    unittest.main()


class Career(unittest.TestCase):
    def test_post_career_fallbacks(self):
        r = random.Random(3)
        outs = {L.post_career_outcome("Kulüp başkanı", "Menajer", 5, 1, random.Random(i)) for i in range(50)}
        self.assertTrue(outs <= set(L.POST_CAREER))
        self.assertEqual(L.post_career_outcome("Futboldan uzaklaşır", "Menajer", 5, 5, r), "Futboldan uzaklaşır")
        self.assertEqual(L.post_career_outcome("???", "???", 5, 5, r), "Futboldan uzaklaşır")

    def test_leadership_helps_coaching(self):
        def rate(lead):
            return sum(L.post_career_outcome("Teknik direktör", "Futboldan uzaklaşır", lead, 10, random.Random(i)) == "Teknik direktör" for i in range(400))
        self.assertLess(rate(2), rate(20))

    def test_years_by(self):
        txt = "2014–2016 · A (genç/rezerv) · 10 maç / 1 gol\n2016–2019 · B · 50 maç / 5 gol\n2019– · A · 20 maç / 2 gol\nbozuk"
        c, k = L.years_by(txt, 2026, {"A": "Türkiye", "B": "İngiltere"})
        self.assertEqual(c, {"A": 2 + 7, "B": 3})
        self.assertEqual(k, {"Türkiye": 9, "İngiltere": 3})

    def test_position_fit(self):
        self.assertEqual(L.position_fit({"Stoper": 20}, "Stoper"), 1.0)
        self.assertEqual(L.position_fit({}, "Stoper"), 0.5)

    def test_incidents_scale_with_traits(self):
        hi = {k: 20 for k in ["dvOlay", "dvKufur", "dvKavga", "dvHakem", "dvKasitli", "dvTahrik", "dvSeyirci"]}; hi["dvSakin"] = 1
        lo = {k: 1 for k in hi}; lo["dvSakin"] = 20
        n = lambda d: sum(len(L.incident_events(d, 90, random.Random(i))) for i in range(500))
        self.assertGreater(n(hi), n(lo) * 5)
        self.assertEqual(L.incident_events(hi, 0, random.Random(1)), [])
