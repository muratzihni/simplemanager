"""CANLI API TESTLERİ — yalnızca API anahtarı ve ağ erişimi varken çalışır, aksi halde ATLANIR.

Çalıştırma:
  FMDATA_FOOTBALL_DATA_ORG_TOKEN=... FMDATA_LIVE_FD_COMPETITION=PL  python -m unittest tests.live.test_live_providers -v
  FMDATA_API_FOOTBALL_KEY=...        FMDATA_LIVE_AF_LEAGUE=203       python -m unittest tests.live.test_live_providers -v

Bu testler geçene kadar adaptörlerin canlı API ile uyumlu olduğu İDDİA EDİLEMEZ.
"""
import os
import unittest

from fmdata.db import connect, migrate
from fmdata.importer import Importer
from fmdata.providers.api_football import ApiFootball
from fmdata.providers.football_data_org import FootballDataOrg

SEASON = os.environ.get("FMDATA_LIVE_SEASON", "2026-27")


@unittest.skipUnless(os.environ.get("FMDATA_FOOTBALL_DATA_ORG_TOKEN"), "FMDATA_FOOTBALL_DATA_ORG_TOKEN yok: canlı test atlandı")
class LiveFootballDataOrg(unittest.TestCase):
    def test_full_import_single_league(self):
        league = os.environ.get("FMDATA_LIVE_FD_COMPETITION", "PL")
        c = connect(":memory:")
        migrate(c)
        prov = FootballDataOrg.from_env()
        s = Importer(c, prov).import_league(league, SEASON, steps=("setup", "squads"))
        self.assertIn(s.status, ("succeeded", "partial"), s)
        self.assertGreater(c.execute("SELECT COUNT(*) FROM clubs").fetchone()[0], 5)
        self.assertGreater(c.execute("SELECT COUNT(*) FROM players").fetchone()[0], 100)
        self.assertTrue(s.validation["ok"], s.validation)
        before = c.execute("SELECT COUNT(*) FROM players").fetchone()[0]
        Importer(c, prov).import_league(league, SEASON, steps=("setup", "squads"))
        self.assertEqual(before, c.execute("SELECT COUNT(*) FROM players").fetchone()[0])   # canlı veride de idempotent


@unittest.skipUnless(os.environ.get("FMDATA_API_FOOTBALL_KEY"), "FMDATA_API_FOOTBALL_KEY yok: canlı test atlandı")
class LiveApiFootball(unittest.TestCase):
    def test_full_import_single_league(self):
        league = os.environ.get("FMDATA_LIVE_AF_LEAGUE", "203")
        c = connect(":memory:")
        migrate(c)
        prov = ApiFootball.from_env()
        s = Importer(c, prov).import_league(league, SEASON)
        self.assertIn(s.status, ("succeeded", "partial"), s)
        self.assertGreater(c.execute("SELECT COUNT(*) FROM clubs").fetchone()[0], 5)
        self.assertGreater(c.execute("SELECT COUNT(*) FROM players").fetchone()[0], 100)
        self.assertTrue(s.validation["ok"], s.validation)
        # Doğrulanması gerekenler: transfer 'type' değerleri ve injuries 'reason' alanları gerçekten beklenen biçimde mi
        kinds = {r[0] for r in c.execute("SELECT DISTINCT transfer_type FROM transfers")}
        print("canlı transfer türleri:", kinds)
        reasons = {r[0] for r in c.execute("SELECT DISTINCT injury_type FROM player_injuries")}
        print("canlı sakatlık nedenleri (örnek):", sorted(reasons)[:15])


if __name__ == "__main__":
    unittest.main()
