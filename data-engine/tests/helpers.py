"""TEST ÇİFTLERİ: Bu dosyadaki sağlayıcı ve veriler SENTETİKTİR (gerçek futbol verisi değildir).
Amaç yalnızca motorun mantığını doğrulamaktır; gerçek API doğrulaması tests/live altındadır."""
from __future__ import annotations

from fmdata.db import connect, migrate
from fmdata.models import PClub, PCoach, PInjury, PLeague, PPlayer, PSuspension, PTransfer
from fmdata.providers.base import NotSupported, Provider


def new_db():
    c = connect(":memory:")
    migrate(c)
    return c


def player(ref, name, dob="2000-01-01", nat="Testland", pos="MID", num=None):
    return PPlayer(ref=ref, full_name=name, birth_date=dob, nationality=nat, position=pos, shirt_number=num)


class FakeProvider(Provider):
    code = "fake"
    name = "Test double (sentetik)"
    base_url = "http://localhost"
    capabilities = frozenset({"leagues", "clubs", "squads", "coach", "transfers", "injuries", "suspensions"})

    def __init__(self, squads=None, transfers=None, injuries=None, suspensions=None, unsupported=(), coaches=None, raise_on=None):
        self.squads = squads if squads is not None else default_squads()
        self._transfers = transfers or []
        self._injuries = injuries or []
        self._susp = suspensions or []
        self.unsupported = set(unsupported)
        self.coaches = coaches or {}
        self.raise_on = raise_on

    def _chk(self, what):
        if what in self.unsupported:
            raise NotSupported(what)
        if self.raise_on and self.raise_on[0] == what:
            raise self.raise_on[1]

    def leagues(self):
        self._chk("leagues")
        return [PLeague(ref="L1", name="Test Ligi", country="Testland", seasons={"2026": {"start": "2026-08-01", "end": "2027-05-30"}})]

    def clubs(self, league_ref, season_year):
        self._chk("clubs")
        return [PClub(ref=ref, name=f"Kulüp {ref}", squad=list(sq), stadium_name=f"Stadyum {ref}", stadium_capacity=10000, founded_year=1900)
                for ref, sq in self.squads.items()]

    def coach(self, club_ref):
        self._chk("coach")
        return self.coaches.get(club_ref)

    def transfers(self, club_ref):
        self._chk("transfers")
        return [t for t in self._transfers if club_ref in (t.from_club_ref, t.to_club_ref)]

    def injuries(self, league_ref, season_year):
        self._chk("injuries")
        return list(self._injuries)

    def suspensions(self, league_ref, season_year):
        self._chk("suspensions")
        return list(self._susp)


def default_squads():
    return {
        "A": [player("a1", "Ali Test", "2000-01-01", num=1), player("a2", "Berk Deneme", "1999-05-05", num=2), player("a3", "Cem Örnek", "2001-03-03", num=3)],
        "B": [player("b1", "Deniz Sınav", "1998-02-02", num=1), player("b2", "Emre Prova", "2002-07-07", num=2)],
    }


def count(conn, table):
    return conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]


ALL_TABLES = ["countries", "competitions", "seasons", "clubs", "club_competitions", "players", "player_identities", "external_ids",
              "club_squads", "player_contracts", "loan_agreements", "transfers", "player_injuries", "player_suspensions", "managers",
              "coaching_staff", "data_change_history"]


def snapshot_counts(conn):
    return {t: count(conn, t) for t in ALL_TABLES}
