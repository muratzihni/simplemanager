import sqlite3
import unittest

from fmdata.http_client import DailyQuotaExhausted, HttpError
from fmdata.importer import Importer
from fmdata.models import PCoach
from tests.helpers import FakeProvider, count, default_squads, new_db, player, snapshot_counts

TODAY = "2026-11-01"


def imp(conn, provider, today=TODAY):
    return Importer(conn, provider, today=today)


class ImporterTests(unittest.TestCase):
    def test_first_import_creates_everything(self):
        c = new_db()
        s = imp(c, FakeProvider(coaches={"A": PCoach(ref="c1", full_name="Teknik Adam", nationality="Testland")})).import_league("L1", "2026-27")
        self.assertEqual(s.status, "succeeded", s)
        self.assertEqual(count(c, "clubs"), 2)
        self.assertEqual(count(c, "players"), 5)
        self.assertEqual(count(c, "club_squads"), 5)
        self.assertEqual(count(c, "managers"), 1)
        self.assertEqual(count(c, "club_competitions"), 2)
        self.assertEqual(c.execute("SELECT label FROM seasons").fetchone()[0], "2026-27")
        self.assertTrue(s.validation["ok"], s.validation)
        # her kayıtta kaynak ve son kontrol tarihi var
        self.assertEqual(c.execute("SELECT COUNT(*) FROM players WHERE source_id IS NULL OR last_checked_at IS NULL").fetchone()[0], 0)

    def test_rerun_is_idempotent(self):
        c = new_db()
        p = FakeProvider()
        imp(c, p).import_league("L1", "2026-27")
        before = snapshot_counts(c)
        s2 = imp(c, p).import_league("L1", "2026-27")
        after = snapshot_counts(c)
        self.assertEqual(before["players"], after["players"])
        for t in ("clubs", "players", "club_squads", "external_ids", "player_identities", "transfers", "loan_agreements", "club_competitions"):
            self.assertEqual(before[t], after[t], t)
        self.assertEqual(s2.created, 0)
        self.assertEqual(s2.errors, 0)

    def test_changes_are_recorded_in_history(self):
        c = new_db()
        p = FakeProvider()
        imp(c, p).import_league("L1", "2026-27")
        p.squads["A"][0].nationality = "Otherland"
        p.squads["A"][0].height_cm = 188
        imp(c, p).import_league("L1", "2026-27")
        rows = {r["field"]: (r["old_value"], r["new_value"]) for r in c.execute("SELECT * FROM data_change_history WHERE entity_type='player'")}
        self.assertEqual(rows["nationality"], ("Testland", "Otherland"))
        self.assertEqual(rows["height_cm"], (None, "188"))

    def test_verified_value_is_not_overwritten_but_flagged(self):
        c = new_db()
        p = FakeProvider()
        imp(c, p).import_league("L1", "2026-27")
        c.execute("UPDATE players SET verification_status='verified' WHERE full_name='Ali Test'")
        p.squads["A"][0].nationality = "Otherland"
        s = imp(c, p).import_league("L1", "2026-27")
        self.assertEqual(c.execute("SELECT nationality FROM players WHERE full_name='Ali Test'").fetchone()[0], "Testland")
        self.assertEqual(c.execute("SELECT COUNT(*) FROM import_errors WHERE severity='conflict'").fetchone()[0], 1)
        self.assertEqual(s.status, "partial")

    def test_missing_provider_capabilities_are_reported_not_invented(self):
        c = new_db()
        s = imp(c, FakeProvider(unsupported=("transfers", "injuries", "suspensions"))).import_league("L1", "2026-27")
        self.assertEqual(s.status, "succeeded")
        self.assertEqual(len(s.missing_data), 3)
        self.assertEqual(count(c, "transfers"), 0)
        self.assertEqual(count(c, "player_injuries"), 0)
        self.assertEqual(count(c, "player_suspensions"), 0)

    def test_player_missing_from_new_squad_is_closed_with_warning(self):
        c = new_db()
        p = FakeProvider()
        imp(c, p).import_league("L1", "2026-27")
        removed = p.squads["A"].pop()
        s = imp(c, p).import_league("L1", "2026-27")
        row = c.execute("SELECT valid_to FROM club_squads cs JOIN players p ON p.id=cs.player_id WHERE p.full_name=?", (removed.full_name,)).fetchone()
        self.assertEqual(row[0], TODAY)
        self.assertGreaterEqual(c.execute("SELECT COUNT(*) FROM import_errors WHERE import_job_id=? AND severity='warning'", (s.job_id,)).fetchone()[0], 1)

    def test_player_moving_clubs_gets_one_active_membership(self):
        c = new_db()
        p = FakeProvider()
        imp(c, p).import_league("L1", "2026-27")
        moved = p.squads["A"].pop(0)
        p.squads["B"].append(moved)
        imp(c, p, today="2026-12-01").import_league("L1", "2026-27")
        rows = c.execute("SELECT club_id, valid_from, valid_to FROM club_squads cs JOIN players p ON p.id=cs.player_id WHERE p.full_name=? ORDER BY cs.id", (moved.full_name,)).fetchall()
        self.assertEqual(len(rows), 2)
        self.assertIsNotNone(rows[0]["valid_to"])
        self.assertIsNone(rows[1]["valid_to"])
        self.assertNotEqual(rows[0]["club_id"], rows[1]["club_id"])

    def test_http_failure_marks_job_failed_and_rolls_back(self):
        c = new_db()
        p = FakeProvider(raise_on=("transfers", HttpError(500, "http://x/transfers")))
        s = imp(c, p).import_league("L1", "2026-27")
        self.assertEqual(s.status, "failed")
        self.assertEqual(count(c, "players"), 0)           # yarım veri bırakmaz
        self.assertEqual(c.execute("SELECT status FROM import_jobs").fetchone()[0], "failed")
        self.assertGreaterEqual(count(c, "import_errors"), 1)

    def test_quota_exhaustion_fails_cleanly(self):
        c = new_db()
        s = imp(c, FakeProvider(raise_on=("clubs", DailyQuotaExhausted("doldu")))).import_league("L1", "2026-27")
        self.assertEqual(s.status, "failed")
        self.assertIn("kota", c.execute("SELECT message FROM import_errors").fetchone()[0])

    def test_unknown_league_fails(self):
        c = new_db()
        s = imp(c, FakeProvider()).import_league("YOK", "2026-27")
        self.assertEqual(s.status, "failed")

    def test_suspensions_are_never_derived_from_card_counts(self):
        c = new_db()
        imp(c, FakeProvider()).import_league("L1", "2026-27")
        self.assertEqual(count(c, "player_suspensions"), 0)


if __name__ == "__main__":
    unittest.main()
