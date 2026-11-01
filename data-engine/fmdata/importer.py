"""İçe aktarma hattı: lig -> kulüpler -> kadrolar -> transferler/kiralıklar -> sakatlıklar -> cezalar -> doğrulama.

İdempotent: aynı veriyle tekrar çalıştırmak yeni kayıt üretmez. Her değişiklik data_change_history'ye yazılır.
Sağlayıcıda olmayan veri türleri 'eksik' olarak raporlanır; uydurulmaz.
"""
from __future__ import annotations

import json
import re
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import date

from . import squads
from .db import get_or_create_source, utcnow
from .http_client import DailyQuotaExhausted, HttpError, NetworkError
from .identity import find_or_create_player, normalize_name
from .models import PClub, PLeague
from .providers.base import NotSupported, Provider
from .validators import validate

COUNTRY_ALIASES = {
    "turkey": "Türkiye", "turkiye": "Türkiye", "türkiye": "Türkiye", "tur": "Türkiye", "tr": "Türkiye",
    "usa": "United States", "united states of america": "United States", "us": "United States",
    "korea republic": "South Korea", "republic of korea": "South Korea", "czech republic": "Czechia",
    "ivory coast": "Côte d'Ivoire", "cote d'ivoire": "Côte d'Ivoire", "holland": "Netherlands",
}

STEPS = ("setup", "squads", "transfers", "injuries", "suspensions")


def canonical_country(name: str | None) -> str | None:
    if not name:
        return None
    return COUNTRY_ALIASES.get(name.strip().lower(), name.strip())


@dataclass
class ImportSummary:
    job_id: int
    status: str
    seen: int = 0
    created: int = 0
    updated: int = 0
    unchanged: int = 0
    errors: int = 0
    missing_data: list = field(default_factory=list)
    validation: dict | None = None


class Importer:
    def __init__(self, conn: sqlite3.Connection, provider: Provider, today: str | None = None):
        self.conn = conn
        self.provider = provider
        self.today = today or date.today().isoformat()
        self.source_id = get_or_create_source(conn, provider.code, provider.name, provider.base_url, provider.license_note,
                                              None if provider.allows_redistribution is None else int(provider.allows_redistribution))
        self.job_id: int | None = None
        self._c = {"seen": 0, "created": 0, "updated": 0, "unchanged": 0, "errors": 0}
        self.missing: list[str] = []
        self._ctx: dict = {}

    # ---------------------------------------------------------------- iş kaydı
    @contextmanager
    def _job(self, job_type: str, scope: str, params: dict):
        self._c = {k: 0 for k in self._c}
        self.missing = []
        cur = self.conn.execute("INSERT INTO import_jobs(source_id,job_type,scope,status,started_at,params_json) VALUES (?,?,?,'running',?,?)",
                                (self.source_id, job_type, scope, utcnow(), json.dumps(params)))
        self.job_id = cur.lastrowid
        status = "succeeded"
        try:
            self.conn.execute("BEGIN")
            yield
            self.conn.execute("COMMIT")
            if self._c["errors"]:
                status = "partial"
        except DailyQuotaExhausted as e:
            self.conn.execute("ROLLBACK")
            status = "failed"
            self._log_after_rollback("error", None, None, f"günlük kota doldu: {e}")
        except (HttpError, NetworkError, RuntimeError) as e:
            self.conn.execute("ROLLBACK")
            status = "failed"
            self._log_after_rollback("error", None, None, f"{type(e).__name__}: {e}")
        except Exception:
            self.conn.execute("ROLLBACK")
            self._finish("failed")
            raise
        self._finish(status)

    def _log_after_rollback(self, severity, entity, ext, msg):
        self._c["errors"] += 1
        self.conn.execute("INSERT INTO import_errors(import_job_id,severity,entity_type,external_id,message,created_at) VALUES (?,?,?,?,?,?)",
                          (self.job_id, severity, entity, ext, msg, utcnow()))

    def _finish(self, status: str):
        c = self._c
        self.conn.execute(
            "UPDATE import_jobs SET status=?, finished_at=?, records_seen=?, records_created=?, records_updated=?, records_unchanged=?, errors_count=? WHERE id=?",
            (status, utcnow(), c["seen"], c["created"], c["updated"], c["unchanged"], c["errors"], self.job_id))
        self._status = status

    def _err(self, severity: str, entity: str | None, ext: str | None, msg: str, payload=None):
        self._c["errors"] += 1
        self.conn.execute("INSERT INTO import_errors(import_job_id,severity,entity_type,external_id,message,payload_excerpt,created_at) VALUES (?,?,?,?,?,?,?)",
                          (self.job_id, severity, entity, ext, msg, json.dumps(payload, ensure_ascii=False)[:500] if payload is not None else None, utcnow()))

    def _count(self, outcome: str):
        self._c["seen"] += 1
        self._c[{"created": "created", "updated": "updated"}.get(outcome, "unchanged")] += 1

    # ---------------------------------------------------------------- değişiklik geçmişi
    def _set_fields(self, table: str, entity_type: str, row_id: int, values: dict) -> bool:
        """Yalnızca değer sağlanan (None olmayan) alanları günceller. 'verified' kayıtta farklı değer = çelişki, ezilmez."""
        row = self.conn.execute(f"SELECT * FROM {table} WHERE id=?", (row_id,)).fetchone()
        changed = False
        keys = row.keys()
        for k, v in values.items():
            if v is None or k not in keys:
                continue
            old = row[k]
            if old == v:
                continue
            if old is not None and "verification_status" in keys and row["verification_status"] == "verified":
                self._err("conflict", entity_type, str(row_id), f"{k}: doğrulanmış değer '{old}' kaynakta '{v}'; ezilmedi")
                continue
            self.conn.execute(f"UPDATE {table} SET {k}=? WHERE id=?", (v, row_id))
            self.conn.execute("INSERT INTO data_change_history(entity_type,entity_id,field,old_value,new_value,source_id,import_job_id,changed_at) VALUES (?,?,?,?,?,?,?,?)",
                              (entity_type, row_id, k, None if old is None else str(old), str(v), self.source_id, self.job_id, utcnow()))
            changed = True
        if "last_checked_at" in keys:
            self.conn.execute(f"UPDATE {table} SET last_checked_at=? WHERE id=?", (utcnow(), row_id))
        return changed

    def _link(self, entity_type: str, entity_id: int, ext: str):
        now = utcnow()
        self.conn.execute(
            "INSERT INTO external_ids(entity_type,entity_id,source_id,external_id,first_seen_at,last_seen_at) VALUES (?,?,?,?,?,?) "
            "ON CONFLICT(entity_type,source_id,external_id) DO UPDATE SET last_seen_at=excluded.last_seen_at",
            (entity_type, entity_id, self.source_id, ext, now, now))

    def _by_ext(self, entity_type: str, ext: str | None):
        if ext is None:
            return None
        r = self.conn.execute("SELECT entity_id FROM external_ids WHERE entity_type=? AND source_id=? AND external_id=?",
                              (entity_type, self.source_id, str(ext))).fetchone()
        return r[0] if r else None

    # ---------------------------------------------------------------- varlıklar
    def _country(self, name: str | None) -> int | None:
        name = canonical_country(name)
        if not name:
            return None
        r = self.conn.execute("SELECT id FROM countries WHERE name=?", (name,)).fetchone()
        if r:
            return r[0]
        return self.conn.execute("INSERT INTO countries(name,created_at) VALUES (?,?)", (name, utcnow())).lastrowid

    def _competition_and_season(self, lg: PLeague, season_year: int, season_label: str):
        cid = self._country(lg.country)
        ctype = "cup" if lg.kind == "cup" else "league"
        r = self.conn.execute("SELECT id FROM competitions WHERE COALESCE(country_id,0)=COALESCE(?,0) AND name=? AND type=?", (cid, lg.name, ctype)).fetchone()
        if r:
            comp_id = r[0]
        else:
            comp_id = self.conn.execute("INSERT INTO competitions(country_id,name,type,tier,created_at) VALUES (?,?,?,?,?)",
                                        (cid, lg.name, ctype, 1 if ctype == "league" else None, utcnow())).lastrowid
        self._link("competition", comp_id, lg.ref)
        info = lg.seasons.get(str(season_year), {})
        r = self.conn.execute("SELECT id FROM seasons WHERE competition_id=? AND label=?", (comp_id, season_label)).fetchone()
        if r:
            sid = r[0]
            self._set_fields("seasons", "season", sid, {"start_date": info.get("start"), "end_date": info.get("end")})
        else:
            sid = self.conn.execute("INSERT INTO seasons(competition_id,label,start_date,end_date) VALUES (?,?,?,?)",
                                    (comp_id, season_label, info.get("start"), info.get("end"))).lastrowid
        return comp_id, sid

    def _club(self, pc: PClub, country_id: int | None, fallback_country_id: int | None = None) -> tuple[int, str]:
        club_id = self._by_ext("club", pc.ref)
        cid = country_id or self._country(pc.country) or fallback_country_id
        vals = {"short_name": pc.short_name, "tla": pc.tla, "city": pc.city, "founded_year": pc.founded_year,
                "stadium_name": pc.stadium_name, "stadium_capacity": pc.stadium_capacity, "country_id": cid}
        if club_id:
            ch = self._set_fields("clubs", "club", club_id, vals)
            self._link("club", club_id, pc.ref)
            return club_id, "updated" if ch else "unchanged"
        r = self.conn.execute("SELECT id FROM clubs WHERE COALESCE(country_id,0)=COALESCE(?,0) AND name=?", (cid, pc.name)).fetchone()
        if r:
            club_id = r[0]
            ch = self._set_fields("clubs", "club", club_id, vals)
            self._link("club", club_id, pc.ref)
            return club_id, "updated" if ch else "unchanged"
        club_id = self.conn.execute(
            "INSERT INTO clubs(name,short_name,tla,country_id,city,founded_year,stadium_name,stadium_capacity,source_id,verification_status,confidence,last_checked_at,created_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,'provider_reported',0.8,?,?)",
            (pc.name, pc.short_name, pc.tla, cid, pc.city, pc.founded_year, pc.stadium_name, pc.stadium_capacity, self.source_id, utcnow(), utcnow())).lastrowid
        self._link("club", club_id, pc.ref)
        return club_id, "created"

    def _club_stub(self, ref: str | None, name: str | None) -> int | None:
        """Transfer kayıtlarında geçen, içe aktarılan ligde olmayan kulüp: asgari kayıt, 'unverified'."""
        if not ref and not name:
            return None
        if ref:
            cid = self._by_ext("club", ref)
            if cid:
                return cid
        if not name:
            return None
        r = self.conn.execute("SELECT id FROM clubs WHERE country_id IS NULL AND name=?", (name,)).fetchone() or \
            self.conn.execute("SELECT id FROM clubs WHERE name=? ORDER BY country_id IS NULL DESC LIMIT 1", (name,)).fetchone()
        if r:
            cid = r[0]
        else:
            cid = self.conn.execute("INSERT INTO clubs(name,source_id,verification_status,confidence,last_checked_at,created_at) VALUES (?,?,'unverified',0.4,?,?)",
                                    (name, self.source_id, utcnow(), utcnow())).lastrowid
        if ref:
            self._link("club", cid, ref)
        return cid

    # ---------------------------------------------------------------- adımlar
    def _step_setup(self, league_ref: str, year: int, label: str):
        lg = next((x for x in self.provider.leagues() if x.ref == str(league_ref)), None)
        if lg is None:
            raise RuntimeError(f"lig '{league_ref}' sağlayıcıda bulunamadı")
        comp_id, season_id = self._competition_and_season(lg, year, label)
        clubs = self.provider.clubs(league_ref, year)
        if not clubs:
            self._err("warning", "competition", league_ref, "sağlayıcı bu lig/sezon için kulüp döndürmedi")
        country_id = self._country(lg.country)
        club_rows = []
        for pc in clubs:
            cid, outcome = self._club(pc, None, country_id)
            self._count(outcome)
            self.conn.execute("INSERT OR IGNORE INTO club_competitions(club_id,season_id) VALUES (?,?)", (cid, season_id))
            club_rows.append((pc, cid))
        self._ctx = {"comp_id": comp_id, "season_id": season_id, "clubs": club_rows, "league": league_ref, "year": year}

    def _step_squads(self):
        ctx = self._ctx
        for pc, club_id in ctx["clubs"]:
            squad = pc.squad
            if squad is None:
                try:
                    squad = self.provider.squad(pc.ref, ctx["year"])
                except NotSupported:
                    self.missing.append("kadro (sağlayıcı sunmuyor)")
                    return
            seen_players = set()
            for pp in squad:
                res = find_or_create_player(self.conn, self.source_id, pp, self.job_id, lambda sev, ent, ext, msg: self._err(sev, ent, ext, msg))
                self._count("created" if res.created else "unchanged")
                seen_players.add(res.player_id)
                vals = {"first_name": pp.first_name, "last_name": pp.last_name, "birth_date": pp.birth_date, "nationality": pp.nationality,
                        "second_nationality": pp.second_nationality, "height_cm": pp.height_cm, "weight_kg": pp.weight_kg,
                        "preferred_foot": pp.preferred_foot, "primary_position": pp.position}
                if not res.created:
                    self._set_fields("players", "player", res.player_id, vals)
                outcome = squads.set_active_membership(self.conn, player_id=res.player_id, club_id=club_id, season_id=ctx["season_id"],
                                                       shirt_number=pp.shirt_number, from_date=self.today, source_id=self.source_id)
                if outcome in ("opened", "moved"):
                    self.conn.execute("INSERT INTO data_change_history(entity_type,entity_id,field,old_value,new_value,source_id,import_job_id,changed_at) VALUES ('player',?,'active_club',NULL,?,?,?,?)",
                                      (res.player_id, str(club_id), self.source_id, self.job_id, utcnow()))
                    if outcome == "moved":
                        self._err("warning", "player", pp.ref, f"'{pp.full_name}' başka kulüpten bu kulübe taşındı (kadro anlık görüntüsüne göre)")
                # sözleşme bilgisi yalnızca kaynakta varsa
                if pp.contract_end or pp.contract_start:
                    self._upsert_contract(res.player_id, club_id, pp)
            # kadrodan çıkanlar: bu kulüpte açık aktif kaydı olup listede olmayanlar
            for row in self.conn.execute("SELECT * FROM club_squads WHERE club_id=? AND status='active' AND valid_to IS NULL", (club_id,)).fetchall():
                if row["player_id"] not in seen_players:
                    squads.close_active_membership(self.conn, row["player_id"], self.today)
                    self._err("warning", "player", str(row["player_id"]), "oyuncu güncel kadro listesinde yok; kadro kaydı kapatıldı (ayrılış kaynakta doğrulanmadı)")
            # teknik direktör
            coach = pc.coach
            if coach is None:
                try:
                    coach = self.provider.coach(pc.ref)
                except NotSupported:
                    coach = None
                except HttpError as e:
                    self._err("warning", "club", pc.ref, f"teknik direktör alınamadı: {e}")
            if coach:
                self._upsert_manager(club_id, coach)

    def _upsert_contract(self, player_id: int, club_id: int, pp):
        r = self.conn.execute("SELECT id FROM player_contracts WHERE player_id=? AND status='active'", (player_id,)).fetchone()
        if r:
            self._set_fields("player_contracts", "contract", r[0], {"club_id": club_id, "start_date": pp.contract_start, "end_date": pp.contract_end})
        else:
            self.conn.execute("INSERT INTO player_contracts(player_id,club_id,contract_type,start_date,end_date,status,source_id,last_checked_at) VALUES (?,?,?,?,?, 'active',?,?)",
                              (player_id, club_id, "permanent", pp.contract_start, pp.contract_end, self.source_id, utcnow()))

    def _upsert_manager(self, club_id: int, c):
        norm = normalize_name(c.full_name)
        r = self.conn.execute("SELECT id FROM managers WHERE COALESCE(club_id,0)=? AND normalized_name=?", (club_id, norm)).fetchone()
        vals = {"birth_date": c.birth_date, "nationality": c.nationality, "contract_start": c.contract_start, "contract_end": c.contract_end}
        if r:
            self._set_fields("managers", "manager", r[0], vals)
            self._count("unchanged")
            mid = r[0]
        else:
            mid = self.conn.execute("INSERT INTO managers(club_id,full_name,normalized_name,birth_date,nationality,contract_start,contract_end,source_id,last_checked_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
                                    (club_id, c.full_name, norm, c.birth_date, c.nationality, c.contract_start, c.contract_end, self.source_id, utcnow(), utcnow())).lastrowid
            self._count("created")
        if c.ref:
            self._link("manager", mid, c.ref)

    def _step_transfers(self):
        ctx = self._ctx
        for pc, club_id in ctx["clubs"]:
            try:
                transfers = self.provider.transfers(pc.ref)
            except NotSupported:
                self.missing.append("transferler/kiralıklar (sağlayıcı sunmuyor)")
                return
            for t in sorted(transfers, key=lambda x: x.date):
                pid = self._by_ext("player", t.player_ref)
                if not pid:
                    self._err("warning", "transfer", t.player_ref, f"transfer oyuncusu ('{t.player_name}') kadro verisinde yok; atlandı")
                    continue
                from_id = self._club_stub(t.from_club_ref, t.from_club_name)
                to_id = self._club_stub(t.to_club_ref, t.to_club_name)
                future = 1 if t.date > self.today else 0
                row = self.conn.execute(
                    "SELECT id FROM transfers WHERE player_id=? AND transfer_date=? AND transfer_type=? AND COALESCE(from_club_id,0)=? AND COALESCE(to_club_id,0)=?",
                    (pid, t.date, t.kind, from_id or 0, to_id or 0)).fetchone()
                if row:
                    self._set_fields("transfers", "transfer", row[0], {"fee_text": t.fee_text, "is_future": future})
                    tid = row[0]
                    self._count("unchanged")
                else:
                    tid = self.conn.execute(
                        "INSERT INTO transfers(player_id,from_club_id,to_club_id,transfer_date,transfer_type,fee_text,is_future,source_id,last_checked_at) VALUES (?,?,?,?,?,?,?,?,?)",
                        (pid, from_id, to_id, t.date, t.kind, t.fee_text, future, self.source_id, utcnow())).lastrowid
                    self._count("created")
                if t.kind == "loan":
                    self._handle_loan(pid, tid, from_id, to_id, t.date, future)
                elif t.kind == "loan_return":
                    self._handle_loan_return(pid, t.date, future)

    def _handle_loan(self, player_id, transfer_id, parent_id, loan_club_id, start_date, future):
        if not parent_id or not loan_club_id or parent_id == loan_club_id:
            self._err("warning", "transfer", str(transfer_id), "kiralık kaydında kulüplerden biri eksik; kiralık sözleşmesi oluşturulamadı")
            return
        r = self.conn.execute("SELECT id, status FROM loan_agreements WHERE player_id=? AND parent_club_id=? AND loan_club_id=? AND start_date=?",
                              (player_id, parent_id, loan_club_id, start_date)).fetchone()
        status = "scheduled" if future else "active"
        if r:
            lid = r[0]
            self._set_fields("loan_agreements", "loan", lid, {})
            if r["status"] == "scheduled" and not future:
                self.conn.execute("UPDATE loan_agreements SET status='active' WHERE id=?", (lid,))
                squads.start_loan(self.conn, lid, self._ctx.get("season_id"))
        else:
            # bu oyuncunun daha önce başlamış, kapanmamış başka bir kiralığı varsa çakışma
            overl = self.conn.execute("SELECT id FROM loan_agreements WHERE player_id=? AND status='active' AND start_date<=?", (player_id, start_date)).fetchone()
            if overl and not future:
                self.conn.execute("UPDATE loan_agreements SET status='ended', end_date=COALESCE(end_date,?) WHERE id=?", (start_date, overl[0]))
                self._err("warning", "loan", str(overl[0]), "yeni kiralık başladığı için önceki aktif kiralık kapatıldı (bitiş tarihi kaynakta yoktu)")
                squads.end_loan(self.conn, overl[0], start_date, season_id=self._ctx.get("season_id"))
            lid = self.conn.execute(
                "INSERT INTO loan_agreements(player_id,parent_club_id,loan_club_id,start_date,status,source_id,last_checked_at) VALUES (?,?,?,?,?,?,?)",
                (player_id, parent_id, loan_club_id, start_date, status, self.source_id, utcnow())).lastrowid
            if status == "active":
                squads.start_loan(self.conn, lid, self._ctx.get("season_id"))
        self.conn.execute("UPDATE transfers SET loan_agreement_id=? WHERE id=?", (lid, transfer_id))

    def _handle_loan_return(self, player_id, date_, future):
        if future:
            return
        r = self.conn.execute("SELECT id FROM loan_agreements WHERE player_id=? AND status='active' ORDER BY start_date DESC LIMIT 1", (player_id,)).fetchone()
        if r:
            squads.end_loan(self.conn, r[0], date_, season_id=self._ctx.get("season_id"))

    def _step_injuries(self):
        ctx = self._ctx
        try:
            injuries = self.provider.injuries(ctx["league"], ctx["year"])
        except NotSupported:
            self.missing.append("sakatlıklar (sağlayıcı sunmuyor)")
            return
        reported = set()
        for i in injuries:
            pid = self._by_ext("player", i.player_ref)
            if not pid:
                self._err("warning", "injury", i.player_ref, f"sakat oyuncu ('{i.player_name}') kadro verisinde yok; atlandı")
                continue
            reported.add(pid)
            r = self.conn.execute("SELECT id FROM player_injuries WHERE player_id=? AND start_date=? AND injury_type=?", (pid, i.start_date, i.injury_type)).fetchone()
            if r:
                ch = self._set_fields("player_injuries", "injury", r[0], {"expected_return_date": i.expected_return_date})
                self.conn.execute("UPDATE player_injuries SET is_ongoing=1 WHERE id=?", (r[0],))
                self._count("updated" if ch else "unchanged")
            else:
                self.conn.execute(
                    "INSERT INTO player_injuries(player_id,injury_type,start_date,expected_return_date,is_ongoing,source_id,last_checked_at) VALUES (?,?,?,?,1,?,?)",
                    (pid, i.injury_type, i.start_date, i.expected_return_date, self.source_id, utcnow()))
                self._count("created")
        # Artık listede olmayan 'devam eden' sakatlıklar: bitmiş sayılır ama dönüş tarihi UYDURULMAZ
        for r in self.conn.execute("SELECT pi.id, pi.player_id FROM player_injuries pi JOIN club_squads cs ON cs.player_id=pi.player_id "
                                   "JOIN club_competitions cc ON cc.club_id=cs.club_id AND cc.season_id=? WHERE pi.is_ongoing=1 AND pi.source_id=? "
                                   "AND cs.status='active' AND cs.valid_to IS NULL", (ctx["season_id"], self.source_id)).fetchall():
            if r["player_id"] not in reported:
                self.conn.execute("UPDATE player_injuries SET is_ongoing=0, rehab_status='listeden çıktı; dönüş tarihi doğrulanmadı', last_checked_at=? WHERE id=?", (utcnow(), r["id"]))
                self._count("updated")

    def _step_suspensions(self):
        ctx = self._ctx
        try:
            susp = self.provider.suspensions(ctx["league"], ctx["year"])
        except NotSupported:
            self.missing.append("cezalar (sağlayıcı sunmuyor)")
            return
        for s in susp:
            pid = self._by_ext("player", s.player_ref)
            if not pid:
                self._err("warning", "suspension", s.player_ref, f"cezalı oyuncu ('{s.player_name}') kadro verisinde yok; atlandı")
                continue
            r = self.conn.execute("SELECT id FROM player_suspensions WHERE player_id=? AND COALESCE(competition_id,0)=? AND start_date=? AND reason=? AND origin='imported'",
                                  (pid, ctx["comp_id"], s.start_date, s.reason)).fetchone()
            if r:
                self._count("unchanged")
            else:
                self.conn.execute(
                    "INSERT INTO player_suspensions(player_id,competition_id,organization,reason,start_date,end_date,matches_total,matches_remaining,origin,source_id,last_checked_at) "
                    "VALUES (?,?,?,?,?,?,?,?,'imported',?,?)",
                    (pid, ctx["comp_id"], s.organization, s.reason, s.start_date, s.end_date, s.matches_total, s.matches_remaining, self.source_id, utcnow()))
                self._count("created")

    # ---------------------------------------------------------------- genel API
    def import_league(self, league_ref: str, season_label: str, steps=STEPS) -> ImportSummary:
        year = int(re.match(r"\d{4}", season_label).group(0))
        with self._job("import_league", f"{league_ref}/{season_label}", {"steps": list(steps)}):
            self._step_setup(league_ref, year, season_label)
            if "squads" in steps:
                self._step_squads()
            if "transfers" in steps:
                self._step_transfers()
            if "injuries" in steps:
                self._step_injuries()
            if "suspensions" in steps:
                self._step_suspensions()
        return self._summary()

    def refresh(self, step: str, league_ref: str, season_label: str) -> ImportSummary:
        if step not in STEPS or step == "setup":
            raise ValueError(f"bilinmeyen adım: {step}")
        year = int(re.match(r"\d{4}", season_label).group(0))
        with self._job(f"refresh_{step}", f"{league_ref}/{season_label}", {}):
            self._step_setup(league_ref, year, season_label)
            getattr(self, f"_step_{step}")()
        return self._summary()

    def _summary(self) -> ImportSummary:
        c = self._c
        s = ImportSummary(self.job_id, self._status, c["seen"], c["created"], c["updated"], c["unchanged"], c["errors"], list(dict.fromkeys(self.missing)))
        if self._status != "failed":
            s.validation = validate(self.conn)
        return s
