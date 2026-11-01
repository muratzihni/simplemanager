"""SENTETİK yük: gerçek API yanıtı değildir. Bu testler, adaptörün BELGELENMİŞ yanıt biçimlerini doğru ayrıştırdığını
ve eksik alanlarda uydurma yapmadığını doğrular. Canlı API ile uyum için tests/live kullanılmalıdır."""
import json
import unittest

from fmdata.providers import api_football as af
from fmdata.providers import football_data_org as fd
from fmdata.providers.base import NotSupported
from fmdata.http_client import HttpClient


def fake_http(routes):
    def transport(method, url, headers, timeout):
        for key, body in routes.items():
            if key in url:
                return 200, {}, json.dumps(body).encode()
        return 404, {}, b"{}"
    return HttpClient("http://x", transport=transport, sleeper=lambda s: None)


class FootballDataOrgParseTests(unittest.TestCase):
    def test_competitions(self):
        body = {"competitions": [{"id": 1, "name": "Test Lig", "code": "TL", "type": "LEAGUE", "area": {"name": "Testland", "code": "TST"},
                                  "currentSeason": {"startDate": "2026-08-01", "endDate": "2027-05-30"}}, {"name": "idsiz"}]}
        out = fd.parse_competitions(body)
        self.assertEqual(len(out), 1)
        self.assertEqual((out[0].ref, out[0].kind, out[0].seasons["2026"]["end"]), ("TL", "league", "2027-05-30"))

    def test_teams_with_squad_and_coach_and_missing_fields(self):
        body = {"teams": [{"id": 5, "name": "Kulüp", "shortName": "K", "tla": "KLP", "founded": 1905, "venue": "Stat",
                           "coach": {"id": 9, "name": "Hoca", "dateOfBirth": "1970-01-02", "nationality": "Testland", "contract": {"start": "2025-06", "until": "2027-06"}},
                           "squad": [{"id": 1, "name": "Oyuncu Bir", "position": "Goalkeeper", "dateOfBirth": "2000-02-03", "nationality": "Testland"},
                                     {"id": 2, "name": "Oyuncu İki"}]}]}
        club = fd.parse_teams(body)[0]
        self.assertEqual((club.ref, club.founded_year, club.stadium_name), ("5", 1905, "Stat"))
        self.assertIsNone(club.stadium_capacity)                      # kaynakta yok: uydurulmadı
        self.assertEqual(club.squad[0].position, "GK")
        self.assertIsNone(club.squad[1].birth_date)
        self.assertEqual(club.coach.contract_end, "2027-06")

    def test_unsupported_data_types_raise_not_supported(self):
        prov = fd.FootballDataOrg(fake_http({}))
        for fn in (lambda: prov.transfers("1"), lambda: prov.injuries("L", 2026), lambda: prov.suspensions("L", 2026)):
            with self.assertRaises(NotSupported):
                fn()

    def test_adapter_calls_expected_endpoints(self):
        prov = fd.FootballDataOrg(fake_http({"competitions/TL/teams": {"teams": [{"id": 5, "name": "K"}]}, "/competitions": {"competitions": []}}))
        self.assertEqual([c.name for c in prov.clubs("TL", 2026)], ["K"])


class ApiFootballParseTests(unittest.TestCase):
    def test_leagues_teams_players(self):
        lg = af.parse_leagues({"response": [{"league": {"id": 7, "name": "Test", "type": "League"}, "country": {"name": "Testland", "code": "TL"},
                                             "seasons": [{"year": 2026, "start": "2026-08-01", "end": "2027-05-30"}]}]})
        self.assertEqual((lg[0].ref, lg[0].seasons["2026"]["start"]), ("7", "2026-08-01"))
        tm = af.parse_teams({"response": [{"team": {"id": 3, "name": "K", "code": "KLP", "founded": 1900, "country": "Testland"}, "venue": {"name": "S", "city": "Ş", "capacity": 12345}}]})
        self.assertEqual((tm[0].stadium_capacity, tm[0].city), (12345, "Ş"))
        pl = af.parse_players({"response": [{"player": {"id": 11, "name": "A. Soyad", "firstname": "Ad", "lastname": "Soyad", "birth": {"date": "1999-09-09"},
                                                         "nationality": "Testland", "height": "183 cm", "weight": "75 kg"},
                                             "statistics": [{"games": {"position": "Midfielder", "number": 8}}]},
                                            {"player": {"id": 12, "name": "Yalnız Ad"}}]})
        self.assertEqual((pl[0].height_cm, pl[0].weight_kg, pl[0].position, pl[0].shirt_number), (183, 75, "MID", 8))
        self.assertEqual((pl[1].birth_date, pl[1].height_cm), (None, None))

    def test_transfer_classification(self):
        self.assertEqual(af.classify_transfer("Loan"), ("loan", None))
        self.assertEqual(af.classify_transfer("Back from loan"), ("loan_return", None))
        self.assertEqual(af.classify_transfer("Free"), ("free", None))
        self.assertEqual(af.classify_transfer("N/A"), ("unknown", None))
        self.assertEqual(af.classify_transfer("€ 70M"), ("permanent", "€ 70M"))

    def test_transfers_parse(self):
        body = {"response": [{"player": {"id": 1, "name": "X"}, "transfers": [
            {"date": "2026-08-20", "type": "Loan", "teams": {"in": {"id": 2, "name": "B"}, "out": {"id": 1, "name": "A"}}},
            {"date": None, "type": "Free", "teams": {}}]}]}
        t = af.parse_transfers(body)
        self.assertEqual(len(t), 1)
        self.assertEqual((t[0].kind, t[0].from_club_ref, t[0].to_club_ref), ("loan", "1", "2"))

    def test_injury_vs_suspension_split_and_no_invented_return_date(self):
        body = {"response": [
            {"player": {"id": 1, "name": "X", "type": "Missing Fixture", "reason": "Knee Injury"}, "team": {"id": 9}, "fixture": {"date": "2026-10-30T18:00:00+00:00"}},
            {"player": {"id": 2, "name": "Y", "type": "Missing Fixture", "reason": "Red Card"}, "team": {"id": 9}, "fixture": {"date": "2026-10-30T18:00:00+00:00"}},
            {"player": {"id": 3, "name": "Z", "reason": "Knee"}, "team": {"id": 9}, "fixture": {}}]}
        inj, sus = af.parse_injuries(body)
        self.assertEqual((len(inj), len(sus)), (1, 1))
        self.assertIsNone(inj[0].expected_return_date)
        self.assertEqual((sus[0].reason, sus[0].matches_remaining, sus[0].end_date), ("red_card", None, None))

    def test_errors_field_raises(self):
        prov = af.ApiFootball(fake_http({"leagues": {"errors": {"token": "Error/Missing application key"}, "response": []}}))
        with self.assertRaises(RuntimeError):
            prov.leagues()

    def test_squad_merges_numbers_and_paginates(self):
        routes = {"players/squads": {"response": [{"players": [{"id": 11, "number": 10, "position": "Midfielder"}]}]},
                  "players?": {"paging": {"current": 1, "total": 1},
                               "response": [{"player": {"id": 11, "name": "A", "firstname": "Ad", "lastname": "Soyad", "birth": {"date": "1999-09-09"}}, "statistics": [{"games": {}}]}]}}
        sq = af.ApiFootball(fake_http(routes)).squad("3", 2026)
        self.assertEqual((sq[0].shirt_number, sq[0].position, sq[0].birth_date), (10, "MID", "1999-09-09"))


if __name__ == "__main__":
    unittest.main()
