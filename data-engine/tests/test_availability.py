import unittest

from fmdata.rules import availability, game_suspension_for, record_game_suspension, rule_for
from tests.helpers import new_db


def setup():
    c = new_db()
    p = c.execute("INSERT INTO players(full_name,normalized_name,created_at) VALUES ('P','p','x')").lastrowid
    comp = c.execute("INSERT INTO competitions(name,type,created_at) VALUES ('Lig','league','x')").lastrowid
    return c, p, comp


class AvailabilityTests(unittest.TestCase):
    def test_healthy_player_is_available(self):
        c, p, _ = setup()
        self.assertEqual(availability(c, p, "2026-11-01")["status"], "available")

    def test_ongoing_injury_before_estimate_is_unavailable(self):
        c, p, _ = setup()
        c.execute("INSERT INTO player_injuries(player_id,injury_type,start_date,expected_return_date,is_ongoing) VALUES (?,?,?,?,1)", (p, "Knee", "2026-10-20", "2026-11-20"))
        r = availability(c, p, "2026-11-01")
        self.assertEqual((r["status"], r["can_play"]), ("unavailable", False))

    def test_estimate_passed_but_return_unconfirmed_is_doubtful_not_available(self):
        c, p, _ = setup()
        c.execute("INSERT INTO player_injuries(player_id,injury_type,start_date,expected_return_date,is_ongoing) VALUES (?,?,?,?,1)", (p, "Knee", "2026-10-01", "2026-10-20"))
        r = availability(c, p, "2026-11-01")
        self.assertEqual(r["status"], "doubtful")
        self.assertFalse(r["can_play"])

    def test_confirmed_return_makes_player_available(self):
        c, p, _ = setup()
        c.execute("INSERT INTO player_injuries(player_id,injury_type,start_date,actual_return_date,is_ongoing) VALUES (?,?,?,?,0)", (p, "Knee", "2026-10-01", "2026-10-20"))
        self.assertEqual(availability(c, p, "2026-11-01")["status"], "available")
        self.assertEqual(availability(c, p, "2026-10-10")["status"], "unavailable")   # geçmiş tarih: o gün sakattı (sonradan kapanmış kayıt)
        self.assertEqual(availability(c, p, "2026-09-15")["status"], "available")     # sakatlıktan önce

    def test_suspension_by_matches_remaining(self):
        c, p, comp = setup()
        c.execute("INSERT INTO player_suspensions(player_id,competition_id,reason,start_date,matches_total,matches_remaining,origin) VALUES (?,?,?,?,?,?, 'imported')",
                  (p, comp, "red_card", "2026-10-30", 3, 2))
        self.assertEqual(availability(c, p, "2026-11-01", comp)["status"], "unavailable")
        c.execute("UPDATE player_suspensions SET matches_remaining=0")
        self.assertEqual(availability(c, p, "2026-11-01", comp)["status"], "available")

    def test_suspension_with_unknown_duration_is_doubtful(self):
        c, p, comp = setup()
        c.execute("INSERT INTO player_suspensions(player_id,competition_id,reason,start_date,origin) VALUES (?,?,?,?, 'imported')", (p, comp, "disciplinary", "2026-10-30"))
        r = availability(c, p, "2026-11-01", comp)
        self.assertEqual(r["status"], "doubtful")
        self.assertIn("süre bilinmiyor", r["reasons"][0]["detail"])

    def test_suspension_applies_only_to_its_competition(self):
        c, p, comp = setup()
        other = c.execute("INSERT INTO competitions(name,type,created_at) VALUES ('Kupa','cup','x')").lastrowid
        c.execute("INSERT INTO player_suspensions(player_id,competition_id,reason,start_date,matches_remaining,origin) VALUES (?,?,?,?,?, 'imported')", (p, comp, "red_card", "2026-10-30", 2))
        self.assertEqual(availability(c, p, "2026-11-01", other)["status"], "available")
        self.assertEqual(availability(c, p, "2026-11-01", comp)["status"], "unavailable")


class DisciplineRuleTests(unittest.TestCase):
    def test_per_scope_rules_and_game_suspension(self):
        c, p, comp = setup()
        c.execute("INSERT INTO discipline_rules(scope_type,scope_key,yellow_threshold,yellow_ban_matches,red_ban_matches) VALUES ('country','Türkiye',5,1,1)")
        c.execute("INSERT INTO discipline_rules(scope_type,scope_key,yellow_threshold,yellow_ban_matches,red_ban_matches) VALUES ('organization','UEFA',3,1,1)")
        tr = rule_for(c, competition_key=None, organization=None, country_key="Türkiye")
        uefa = rule_for(c, competition_key=None, organization="UEFA", country_key="Türkiye")   # organizasyon ülkeden önce gelir
        self.assertEqual((tr["yellow_threshold"], uefa["yellow_threshold"]), (5, 3))
        self.assertIsNone(game_suspension_for(tr, yellow_cards=4))
        self.assertEqual(game_suspension_for(tr, yellow_cards=5), {"reason": "yellow_accumulation", "matches": 1})
        self.assertEqual(game_suspension_for(uefa, yellow_cards=3)["reason"], "yellow_accumulation")
        self.assertEqual(game_suspension_for(tr, red=True)["reason"], "red_card")
        sid = record_game_suspension(c, p, comp, "2026-11-01", game_suspension_for(tr, red=True))
        row = c.execute("SELECT origin, matches_remaining FROM player_suspensions WHERE id=?", (sid,)).fetchone()
        self.assertEqual(tuple(row), ("game_simulated", 1))
        self.assertEqual(availability(c, p, "2026-11-02", comp)["status"], "unavailable")


if __name__ == "__main__":
    unittest.main()
