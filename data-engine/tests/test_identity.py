import unittest

from fmdata.identity import find_or_create_player, name_similarity, normalize_name
from fmdata.db import get_or_create_source
from fmdata.models import PPlayer
from tests.helpers import count, new_db


class NameTests(unittest.TestCase):
    def test_normalization(self):
        self.assertEqual(normalize_name("İlkay Gündoğan"), "ilkay gundogan")
        self.assertEqual(normalize_name("Mikkel Damsgaard-Ørsted"), "mikkel damsgaard orsted")
        self.assertEqual(normalize_name("Łukasz Fabiański"), "lukasz fabianski")
        self.assertEqual(normalize_name("Müller, Thomas"), "muller thomas")

    def test_similarity(self):
        self.assertEqual(name_similarity("İlkay Gündoğan", "Gundogan Ilkay"), 1.0)
        self.assertGreaterEqual(name_similarity("Vinicius Junior", "Vinicius Jr"), 0.86)
        self.assertGreaterEqual(name_similarity("Gündoğan", "İlkay Gündoğan"), 0.86)
        self.assertLess(name_similarity("Ali Yılmaz", "Mehmet Demir"), 0.6)


class MatcherTests(unittest.TestCase):
    def setUp(self):
        self.c = new_db()
        self.s1 = get_or_create_source(self.c, "s1", "S1")
        self.s2 = get_or_create_source(self.c, "s2", "S2")
        self.log = []

    def _log(self, sev, ent, ext, msg):
        self.log.append((sev, msg))

    def test_same_external_id_returns_same_player(self):
        p = PPlayer(ref="1", full_name="Ali Test", birth_date="2000-01-01")
        a = find_or_create_player(self.c, self.s1, p, None, self._log)
        b = find_or_create_player(self.c, self.s1, p, None, self._log)
        self.assertTrue(a.created)
        self.assertFalse(b.created)
        self.assertEqual(a.player_id, b.player_id)
        self.assertEqual(count(self.c, "players"), 1)

    def test_second_source_with_variant_spelling_is_not_duplicated(self):
        a = find_or_create_player(self.c, self.s1, PPlayer(ref="10", full_name="İlkay Gündoğan", birth_date="1990-10-24"), None, self._log)
        b = find_or_create_player(self.c, self.s2, PPlayer(ref="ZZ", full_name="Ilkay Gundogan", birth_date="1990-10-24"), None, self._log)
        self.assertEqual(a.player_id, b.player_id)
        self.assertFalse(b.created)
        self.assertEqual(count(self.c, "players"), 1)
        self.assertEqual(count(self.c, "external_ids"), 2)
        self.assertEqual(count(self.c, "player_identities"), 1)   # iki yazım normalize edilince aynı: tek takma ad

    def test_same_name_different_birth_date_is_a_different_person(self):
        find_or_create_player(self.c, self.s1, PPlayer(ref="1", full_name="Ali Yılmaz", birth_date="1990-01-01"), None, self._log)
        b = find_or_create_player(self.c, self.s2, PPlayer(ref="2", full_name="Ali Yılmaz", birth_date="2003-04-04"), None, self._log)
        self.assertTrue(b.created)
        self.assertEqual(count(self.c, "players"), 2)

    def test_ambiguous_same_dob_is_flagged_conflict_not_silently_merged(self):
        find_or_create_player(self.c, self.s1, PPlayer(ref="1", full_name="Mehmet Ali Kaya", birth_date="1995-05-05"), None, self._log)
        b = find_or_create_player(self.c, self.s2, PPlayer(ref="2", full_name="Mehmet Kara", birth_date="1995-05-05"), None, self._log)
        row = self.c.execute("SELECT verification_status FROM players WHERE id=?", (b.player_id,)).fetchone()
        if b.created:
            self.assertEqual(row[0], "conflict")
            self.assertTrue(any(l[0] == "conflict" for l in self.log))

    def test_missing_birth_date_is_unverified_with_warning(self):
        a = find_or_create_player(self.c, self.s1, PPlayer(ref="1", full_name="Sadece Isim"), None, self._log)
        row = self.c.execute("SELECT verification_status, birth_date FROM players WHERE id=?", (a.player_id,)).fetchone()
        self.assertEqual(tuple(row), ("unverified", None))
        self.assertTrue(any(l[0] == "warning" for l in self.log))


if __name__ == "__main__":
    unittest.main()
