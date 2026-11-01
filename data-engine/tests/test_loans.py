import sqlite3
import unittest

from fmdata import squads
from fmdata.importer import Importer
from fmdata.models import PTransfer
from fmdata.validators import validate
from tests.helpers import FakeProvider, count, new_db, snapshot_counts


def run(conn, provider, today):
    return Importer(conn, provider, today=today).import_league("L1", "2026-27")


def loan_t(date, kind="loan", frm="A", to="B", who="a1"):
    return PTransfer(player_ref=who, player_name="Ali Test", date=date, kind=kind, from_club_ref=frm, from_club_name=f"Kulüp {frm}",
                     to_club_ref=to, to_club_name=f"Kulüp {to}")


def club_id(c, name):
    return c.execute("SELECT id FROM clubs WHERE name=?", (name,)).fetchone()[0]


class LoanTests(unittest.TestCase):
    def provider_with_loan(self):
        p = FakeProvider(transfers=[loan_t("2026-08-20")])
        # Sağlayıcı kiralık oyuncuyu HEM sahibi (A) HEM kiralayan (B) kadroda listeliyor: sık görülen çakışma durumu
        p.squads["B"].append(p.squads["A"][0])
        return p

    def test_loaned_player_is_active_only_at_loan_club(self):
        c = new_db()
        s = run(c, self.provider_with_loan(), "2026-11-01")
        self.assertTrue(s.validation["ok"], s.validation)
        a, b = club_id(c, "Kulüp A"), club_id(c, "Kulüp B")
        names_a = [r["full_name"] for r in squads.squad_at(c, a, "2026-11-01")]
        names_b = [r["full_name"] for r in squads.squad_at(c, b, "2026-11-01")]
        self.assertNotIn("Ali Test", names_a)
        self.assertIn("Ali Test", names_b)
        # bonservis sahibi ilişkisi ayrı tutulur
        out = c.execute("SELECT COUNT(*) FROM club_squads WHERE club_id=? AND status='on_loan_out' AND valid_to IS NULL", (a,)).fetchone()[0]
        self.assertEqual(out, 1)
        loan = c.execute("SELECT * FROM loan_agreements").fetchone()
        self.assertEqual((loan["parent_club_id"], loan["loan_club_id"], loan["status"]), (a, b, "active"))
        self.assertEqual((loan["option_to_buy"], loan["obligation_to_buy"], loan["recall_clause"]), ("unknown", "unknown", "unknown"))
        self.assertIsNone(loan["wage_share_percent"])
        self.assertIsNone(loan["end_date"])

    def test_player_never_in_two_active_squads_at_any_date(self):
        c = new_db()
        run(c, self.provider_with_loan(), "2026-11-01")
        pid = c.execute("SELECT id FROM players WHERE full_name='Ali Test'").fetchone()[0]
        for d in ("2026-07-01", "2026-08-19", "2026-08-20", "2026-09-15", "2026-11-01"):
            n = c.execute("SELECT COUNT(*) FROM club_squads WHERE player_id=? AND status='active' AND valid_from<=? AND (valid_to IS NULL OR valid_to>?)",
                          (pid, d, d)).fetchone()[0]
            self.assertLessEqual(n, 1, d)

    def test_loan_return_restores_parent_squad(self):
        c = new_db()
        p = self.provider_with_loan()
        run(c, p, "2026-11-01")
        p._transfers.append(loan_t("2027-01-31", kind="loan_return", frm="B", to="A"))
        for sq in p.squads.values():          # dönüş sonrası kadro anlık görüntüsü: oyuncu yalnızca A'da
            pass
        p.squads["B"] = [x for x in p.squads["B"] if x.ref != "a1"]
        s = run(c, p, "2027-02-01")
        a, b = club_id(c, "Kulüp A"), club_id(c, "Kulüp B")
        self.assertIn("Ali Test", [r["full_name"] for r in squads.squad_at(c, a, "2027-02-01")])
        self.assertNotIn("Ali Test", [r["full_name"] for r in squads.squad_at(c, b, "2027-02-01")])
        self.assertEqual(c.execute("SELECT status, end_date FROM loan_agreements").fetchone()[:], ("ended", "2027-01-31"))
        self.assertTrue(validate(c)["ok"], validate(c))

    def test_future_dated_loan_does_not_change_squads_yet(self):
        c = new_db()
        p = FakeProvider(transfers=[loan_t("2027-01-15")])
        run(c, p, "2026-11-01")
        a = club_id(c, "Kulüp A")
        self.assertIn("Ali Test", [r["full_name"] for r in squads.squad_at(c, a, "2026-11-01")])
        loan = c.execute("SELECT status FROM loan_agreements").fetchone()
        self.assertEqual(loan[0], "scheduled")
        self.assertEqual(c.execute("SELECT is_future FROM transfers").fetchone()[0], 1)

    def test_loan_import_is_idempotent(self):
        c = new_db()
        p = self.provider_with_loan()
        run(c, p, "2026-11-01")
        before = snapshot_counts(c)
        run(c, p, "2026-11-01")
        after = snapshot_counts(c)
        for t in ("players", "club_squads", "loan_agreements", "transfers", "clubs"):
            self.assertEqual(before[t], after[t], t)

    def test_direct_double_activation_is_blocked_by_database(self):
        c = new_db()
        run(c, self.provider_with_loan(), "2026-11-01")
        pid = c.execute("SELECT id FROM players WHERE full_name='Ali Test'").fetchone()[0]
        a = club_id(c, "Kulüp A")
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("INSERT INTO club_squads(club_id,player_id,status,valid_from) VALUES (?,?, 'active','2026-11-01')", (a, pid))

    def test_validator_detects_broken_loan_state(self):
        c = new_db()
        run(c, self.provider_with_loan(), "2026-11-01")
        c.execute("UPDATE club_squads SET valid_to='2026-11-01' WHERE status='on_loan_out'")
        rep = validate(c)
        self.assertFalse(rep["ok"])
        self.assertTrue(any("kiralıkta" in e for e in rep["errors"]))


if __name__ == "__main__":
    unittest.main()
