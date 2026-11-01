"""Yönetici tarafından değiştirilebilir güncelleme zamanlaması.

Varsayılanlar saniye cinsindendir ve sağlayıcının güncelleme sıklığı/kotasına göre ayarlanmalıdır.
NOT: 'maç sonrası' tetikleyicileri (kart/ceza ve istatistik) için fikstür/maç bitiş sinyali gerekir; bu modül henüz uygulanmadı.
Bu yüzden şimdilik aralıklı yenileme yapılır.
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .db import utcnow
from .validators import validate

DEFAULT_SCHEDULE = {
    "refresh_squads": 24 * 3600,
    "refresh_transfers": 6 * 3600,
    "refresh_injuries": 6 * 3600,
    "refresh_suspensions": 6 * 3600,
    "validate_full": 7 * 24 * 3600,
}


def load_schedule(path: str | Path | None) -> dict:
    sched = dict(DEFAULT_SCHEDULE)
    if path and Path(path).exists():
        for k, v in json.loads(Path(path).read_text(encoding="utf-8")).items():
            if k not in DEFAULT_SCHEDULE:
                raise ValueError(f"bilinmeyen zamanlama anahtarı: {k}")
            if not isinstance(v, (int, float)) or v <= 0:
                raise ValueError(f"{k}: pozitif saniye değeri olmalı")
            sched[k] = int(v)
    return sched


def _ts(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


class Scheduler:
    def __init__(self, conn: sqlite3.Connection, schedule: dict | None = None):
        self.conn = conn
        self.schedule = dict(schedule or DEFAULT_SCHEDULE)

    def last_run(self, job_type: str, scope: str) -> datetime | None:
        r = self.conn.execute("SELECT MAX(started_at) FROM import_jobs WHERE job_type=? AND scope=? AND status IN ('succeeded','partial')",
                              (job_type, scope)).fetchone()[0]
        return _ts(r) if r else None

    def due(self, scope: str, now: datetime | None = None) -> list[str]:
        now = now or datetime.now(timezone.utc)
        out = []
        for jt, interval in self.schedule.items():
            last = self.last_run(jt, scope)
            if last is None or (now - last).total_seconds() >= interval:
                out.append(jt)
        return out

    def run_due(self, importer, league_ref: str, season_label: str, now: datetime | None = None) -> dict:
        scope = f"{league_ref}/{season_label}"
        results = {}
        for jt in self.due(scope, now):
            if jt == "validate_full":
                rep = validate(self.conn)
                self.conn.execute("INSERT INTO import_jobs(source_id,job_type,scope,status,started_at,finished_at,errors_count) VALUES (?,?,?,?,?,?,?)",
                                  (importer.source_id, jt, scope, "succeeded" if rep["ok"] else "failed", utcnow(), utcnow(), len(rep["errors"])))
                results[jt] = rep
            else:
                results[jt] = importer.refresh(jt.removeprefix("refresh_"), league_ref, season_label)
        return results
