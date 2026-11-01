import datetime as dt
import unittest

from fmdata import eligibility as E


class Switch(unittest.TestCase):
    on = dt.date(2026, 11, 1)

    def test_youth_only_can_switch(self):
        self.assertTrue(E.can_switch(E.NationalRecord(0, None, None, ["Almanya"]), self.on, True))

    def test_needs_new_eligibility(self):
        self.assertFalse(E.can_switch(E.NationalRecord(), self.on, False))

    def test_locked_after_many_caps(self):
        self.assertFalse(E.can_switch(E.NationalRecord(10, 20, dt.date(2020, 1, 1)), self.on, True))

    def test_exception_under_three_caps_and_three_years(self):
        r = E.NationalRecord(2, 19, dt.date(2022, 3, 1))
        self.assertTrue(E.can_switch(r, self.on, True))
        r2 = E.NationalRecord(2, 19, dt.date(2025, 3, 1))
        self.assertFalse(E.can_switch(r2, self.on, True))
        r3 = E.NationalRecord(2, 23, dt.date(2020, 3, 1))
        self.assertFalse(E.can_switch(r3, self.on, True))

    def test_citizenships_dedupe(self):
        self.assertEqual(E.eligible_nations(["Türkiye", "", "Almanya", "Türkiye"]), ["Türkiye", "Almanya"])


class Money(unittest.TestCase):
    c = {"macPrim": 100, "ilk11": 50, "galibiyet": 300, "beraberlik": 100, "golPrim": 200, "asistPrim": 150, "csPrim": 80,
         "sampiyonPrim": 1000, "slPrim": 500, "sadakat": 70, "sureMac": 20, "surePrim": 40, "dususKesinti": 25}

    def test_match_bonus(self):
        self.assertEqual(E.match_bonus(self.c, started=True, result="W", goals=2, assists=1), 100 + 50 + 300 + 400 + 150)
        self.assertEqual(E.match_bonus(self.c, started=False, result="L"), 100)
        self.assertEqual(E.match_bonus(self.c, started=True, result="D", clean_sheet=True, defender_or_keeper=True), 100 + 50 + 100 + 80)
        self.assertEqual(E.match_bonus(self.c, started=True, result="D", clean_sheet=True), 250)

    def test_season_bonus(self):
        self.assertEqual(E.season_end_bonus(self.c, league_title=True, champions_league=True, appearances=25), 1000 + 500 + 40 + 70)
        self.assertEqual(E.season_end_bonus(self.c, appearances=5), 70)

    def test_relegation_wage(self):
        self.assertEqual(E.wage_after_relegation(1000, self.c), 750)

    def test_agent(self):
        self.assertEqual(E.agent_demand_multiplier(1), 1.0)
        self.assertEqual(E.agent_demand_multiplier(20), 1.5)
        self.assertLess(E.agent_demand_multiplier(5), E.agent_demand_multiplier(15))
        self.assertEqual(E.agent_fee(10, 1000, 200), 120)

    def test_parsers(self):
        self.assertEqual(E.parse_tournament_bonus("Şampiyonlar Ligi · Grubu geçmek · 2.000.000"), [("Şampiyonlar Ligi", "Grubu geçmek", 2000000)])
        with self.assertRaises(ValueError):
            E.parse_tournament_bonus("bozuk satır")
        self.assertEqual(E.parse_opponent_stats("Hollanda · 3 · 1\nHollanda · 2 · 0\nAlmanya · 1 · 0"), {"Hollanda": (5, 1), "Almanya": (1, 0)})
        with self.assertRaises(ValueError):
            E.parse_opponent_stats("Hollanda · 3")


if __name__ == "__main__":
    unittest.main()
