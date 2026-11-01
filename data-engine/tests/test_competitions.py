import unittest

from fmdata import competitions as C


class Tests(unittest.TestCase):
    def test_coefficient_window(self):
        self.assertEqual(C.club_coefficient([10, 9, 8, 7, 6, 100]), 40)
        self.assertEqual(C.club_coefficient([1.5, 2.25]), 3.75)

    def test_season_points(self):
        self.assertEqual(C.season_points(4, 2, stage_bonus=5, qualifying_wins=2, qualifying_draws=2), 8 + 2 + 5 + 2 + 1)

    def test_association(self):
        self.assertEqual(C.association_coefficient([10, 20, 30], 3), 20)
        with self.assertRaises(ValueError):
            C.association_coefficient([1], 0)

    def test_rating_delta_symmetry_and_upset(self):
        win_even = C.national_rating_delta(C.Match(3, 50, 1500, 1500))
        self.assertAlmostEqual(win_even, 25.0)
        upset = C.national_rating_delta(C.Match(3, 50, 1900, 1500))
        self.assertGreater(upset, win_even)
        loss_fav = C.national_rating_delta(C.Match(0, 50, 1200, 1800))
        self.assertLess(loss_fav, -40)
        # sıfır toplamlı: A'nın kazancı = B'nin kaybı
        a = C.national_rating_delta(C.Match(3, 25, 1600, 1500)); b = C.national_rating_delta(C.Match(0, 25, 1500, 1600))
        self.assertAlmostEqual(a, -b)

    def test_rank_stable(self):
        self.assertEqual(C.rank({"B": 10, "A": 10, "C": 20}), {"C": 1, "A": 2, "B": 3})

    def test_swap(self):
        f = {"ad": "Fenerbahçe", "ulke": "Türkiye", "lig": "Süper Lig"}
        m = {"ad": "Manchester United", "ulke": "İngiltere", "lig": "Premier League"}
        f2, m2 = C.swap_leagues(f, m)
        self.assertEqual((f2["ulke"], f2["lig"]), ("İngiltere", "Premier League"))
        self.assertEqual((m2["ulke"], m2["lig"]), ("Türkiye", "Süper Lig"))
        self.assertEqual(f["ulke"], "Türkiye")  # orijinal değişmez
        with self.assertRaises(ValueError):
            C.swap_leagues(f, f)

    def test_participants(self):
        self.assertEqual(C.validate_participants(["A", "B"], {"A", "B"}, 2), [])
        e = C.validate_participants(["A", "A", "Z"], {"A"}, 2)
        self.assertEqual(len(e), 3)


if __name__ == "__main__":
    unittest.main()
