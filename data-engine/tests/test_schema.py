import sqlite3
import unittest

from fmdata.db import connect, migrate
from tests.helpers import new_db


class SchemaTests(unittest.TestCase):
    def test_migrate_is_idempotent(self):
        c = connect(":memory:")
        self.assertEqual(migrate(c), [1])
        self.assertEqual(migrate(c), [])
        for t in ["countries", "competitions", "seasons", "clubs", "players", "player_identities", "club_squads", "player_contracts",
                  "transfers", "loan_agreements", "player_injuries", "player_suspensions", "player_statistics", "managers", "coaching_staff",
                  "data_sources", "external_ids", "import_jobs", "import_errors", "data_change_history", "game_database_versions"]:
            self.assertEqual(c.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()[0], 1, t)

    def _club(self, c, name):
        return c.execute("INSERT INTO clubs(name,created_at) VALUES (?, 'x')", (name,)).lastrowid

    def _player(self, c, name="P"):
        return c.execute("INSERT INTO players(full_name,normalized_name,created_at) VALUES (?,?, 'x')", (name, name.lower())).lastrowid

    def test_foreign_keys_enforced(self):
        c = new_db()
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from) VALUES (999,999,'active','2026-01-01')")

    def test_player_cannot_be_active_in_two_clubs_at_once(self):
        c = new_db()
        a, b, p = self._club(c, "A"), self._club(c, "B"), self._player(c)
        c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from) VALUES (?,?, 'active','2026-01-01')", (a, p))
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from) VALUES (?,?, 'active','2026-02-01')", (b, p))

    def test_historical_overlap_is_rejected_but_back_to_back_is_allowed(self):
        c = new_db()
        a, b, p = self._club(c, "A"), self._club(c, "B"), self._player(c)
        c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from,valid_to) VALUES (?,?, 'active','2025-01-01','2025-07-01')", (a, p))
        c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from,valid_to) VALUES (?,?, 'active','2025-07-01','2026-01-01')", (b, p))  # bitişik: serbest
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from,valid_to) VALUES (?,?, 'active','2025-06-01','2025-08-01')", (a, p))

    def test_loan_constraints(self):
        c = new_db()
        a, p = self._club(c, "A"), self._player(c)
        with self.assertRaises(sqlite3.IntegrityError):   # sahibi = kiralayan olamaz
            c.execute("INSERT INTO loan_agreements(player_id,parent_club_id,loan_club_id,start_date,status) VALUES (?,?,?,'2026-01-01','active')", (p, a, a))
        b = self._club(c, "B")
        with self.assertRaises(sqlite3.IntegrityError):   # bitiş başlangıçtan önce olamaz
            c.execute("INSERT INTO loan_agreements(player_id,parent_club_id,loan_club_id,start_date,end_date,status) VALUES (?,?,?,'2026-06-01','2026-01-01','active')", (p, a, b))
        c.execute("INSERT INTO loan_agreements(player_id,parent_club_id,loan_club_id,start_date,status) VALUES (?,?,?,'2026-01-01','active')", (p, a, b))
        row = c.execute("SELECT option_to_buy, obligation_to_buy, recall_clause, wage_share_percent FROM loan_agreements").fetchone()
        self.assertEqual(tuple(row), ("unknown", "unknown", "unknown", None))   # doğrulanamayan sözleşme maddeleri 'bilinmiyor'

    def test_unique_external_ids_and_single_current_version(self):
        c = new_db()
        s = c.execute("INSERT INTO data_sources(code,name,created_at) VALUES ('s','s','x')").lastrowid
        p = self._player(c)
        c.execute("INSERT INTO external_ids(entity_type,entity_id,source_id,external_id,first_seen_at,last_seen_at) VALUES ('player',?,?, '1','x','x')", (p, s))
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO external_ids(entity_type,entity_id,source_id,external_id,first_seen_at,last_seen_at) VALUES ('player',?,?, '1','x','x')", (p, s))
        c.execute("INSERT INTO game_database_versions(version,created_at,snapshot_path,is_current) VALUES (1,'x','a',1)")
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO game_database_versions(version,created_at,snapshot_path,is_current) VALUES (2,'x','b',1)")

    def test_data_check_constraints(self):
        c = new_db()
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO players(full_name,normalized_name,height_cm,created_at) VALUES ('x','x',500,'x')")
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO clubs(name,founded_year,created_at) VALUES ('x',1500,'x')")


if __name__ == "__main__":
    unittest.main()
