import io
import json
import os
import tempfile
import unittest
from contextlib import redirect_stdout
from datetime import datetime, timedelta, timezone

from fmdata import cli
from fmdata.db import connect, migrate
from fmdata.importer import Importer
from fmdata.scheduler import DEFAULT_SCHEDULE, Scheduler, load_schedule
from tests.helpers import FakeProvider, new_db


class ScheduleTests(unittest.TestCase):
    def test_defaults_match_policy(self):
        self.assertEqual(DEFAULT_SCHEDULE["refresh_squads"], 24 * 3600)
        self.assertEqual(DEFAULT_SCHEDULE["refresh_transfers"], 6 * 3600)
        self.assertEqual(DEFAULT_SCHEDULE["refresh_injuries"], 6 * 3600)
        self.assertEqual(DEFAULT_SCHEDULE["validate_full"], 7 * 24 * 3600)

    def test_admin_override_and_validation(self):
        with tempfile.TemporaryDirectory() as d:
            f = os.path.join(d, "s.json")
            open(f, "w").write(json.dumps({"refresh_squads": 3600}))
            self.assertEqual(load_schedule(f)["refresh_squads"], 3600)
            open(f, "w").write(json.dumps({"refresh_nothing": 5}))
            with self.assertRaises(ValueError):
                load_schedule(f)
            open(f, "w").write(json.dumps({"refresh_squads": -1}))
            with self.assertRaises(ValueError):
                load_schedule(f)

    def test_due_logic_and_run_due(self):
        c = new_db()
        imp = Importer(c, FakeProvider(), today="2026-11-01")
        s = Scheduler(c)
        now = datetime.now(timezone.utc)
        self.assertEqual(set(s.due("L1/2026-27", now)), set(DEFAULT_SCHEDULE))        # hiç çalışmamış: hepsi vadesi gelmiş
        res = s.run_due(imp, "L1", "2026-27", now)
        self.assertEqual(set(res), set(DEFAULT_SCHEDULE))
        self.assertEqual(s.due("L1/2026-27", now), [])                                   # hemen sonra hiçbiri vadesi gelmiş değil
        later = now + timedelta(hours=7)
        self.assertEqual(set(s.due("L1/2026-27", later)), {"refresh_transfers", "refresh_injuries", "refresh_suspensions"})
        much_later = now + timedelta(days=8)
        self.assertEqual(set(s.due("L1/2026-27", much_later)), set(DEFAULT_SCHEDULE))


class CliTests(unittest.TestCase):
    def run_cli(self, *args):
        buf = io.StringIO()
        with redirect_stdout(buf):
            try:
                cli.main(list(args))
                code = 0
            except SystemExit as e:
                code = e.code or 0
        return code, buf.getvalue()

    def test_publish_rollback_flow(self):
        with tempfile.TemporaryDirectory() as d:
            db = os.path.join(d, "g.sqlite")
            conn = connect(db)
            migrate(conn)
            Importer(conn, FakeProvider(), today="2026-11-01").import_league("L1", "2026-27")
            conn.close()
            code, out = self.run_cli("--db", db, "publish", "--out-dir", os.path.join(d, "dist"), "--description", "ilk")
            self.assertEqual(code, 0, out)
            code, out = self.run_cli("--db", db, "publish", "--out-dir", os.path.join(d, "dist"), "--description", "ikinci")
            self.assertEqual(code, 0, out)
            c2 = connect(db)
            self.assertEqual([r[0] for r in c2.execute("SELECT version FROM game_database_versions ORDER BY version")], [1, 2])
            self.assertEqual(c2.execute("SELECT version FROM game_database_versions WHERE is_current=1").fetchone()[0], 2)
            snap = connect(os.path.join(d, "dist", "fmdata_v1.sqlite"))
            self.assertEqual(snap.execute("SELECT COUNT(*) FROM players").fetchone()[0], 5)
            c2.close()
            code, out = self.run_cli("--db", db, "rollback")
            self.assertEqual(code, 0, out)
            c3 = connect(db)
            self.assertEqual(c3.execute("SELECT version FROM game_database_versions WHERE is_current=1").fetchone()[0], 1)
            c3.close()
            code, out = self.run_cli("--db", db, "rollback")     # v1'in öncülü yok
            self.assertEqual(code, 1)

    def test_publish_refused_when_validation_fails(self):
        with tempfile.TemporaryDirectory() as d:
            db = os.path.join(d, "g.sqlite")
            conn = connect(db)
            migrate(conn)
            Importer(conn, FakeProvider(), today="2026-11-01").import_league("L1", "2026-27")
            conn.execute("PRAGMA foreign_keys=OFF")
            conn.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from) VALUES (9999,9999,'inactive','2026-01-01')")
            conn.close()
            code, out = self.run_cli("--db", db, "publish", "--out-dir", os.path.join(d, "dist"))
            self.assertEqual(code, 1)
            self.assertIn("reddedildi", out)

    def test_publish_for_distribution_is_refused_without_redistribution_rights(self):
        with tempfile.TemporaryDirectory() as d:
            db = os.path.join(d, "g.sqlite")
            conn = connect(db)
            migrate(conn)
            Importer(conn, FakeProvider(), today="2026-11-01").import_league("L1", "2026-27")
            conn.close()
            code, out = self.run_cli("--db", db, "publish", "--out-dir", os.path.join(d, "dist"), "--for-distribution")
            self.assertEqual(code, 1)
            self.assertIn("yeniden dağıtım", out)
            self.assertFalse(os.path.exists(os.path.join(d, "dist", "fmdata_v1.sqlite")))
            code, out = self.run_cli("--db", db, "publish", "--out-dir", os.path.join(d, "dist"))   # dahili kullanım serbest
            self.assertEqual(code, 0)
            self.assertIn("DAHİLİ", out)
            c2 = connect(db)
            c2.execute("UPDATE data_sources SET allows_redistribution=1")                          # hak doğrulandı (örnek)
            c2.close()
            code, out = self.run_cli("--db", db, "publish", "--out-dir", os.path.join(d, "dist"), "--for-distribution")
            self.assertEqual(code, 0, out)

    def test_import_without_api_key_fails_clearly(self):
        os.environ.pop("FMDATA_API_FOOTBALL_KEY", None)
        with tempfile.TemporaryDirectory() as d:
            code, _ = self.run_cli("--db", os.path.join(d, "x.sqlite"), "import", "--provider", "api-football", "--league", "203", "--season", "2026-27")
            self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
