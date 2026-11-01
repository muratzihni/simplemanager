"""Komut satırı: fmdata <komut>. API anahtarları yalnızca ortam değişkenlerinden okunur (dosyaya/günlüğe yazılmaz)."""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from . import db as dbm
from .importer import Importer
from .providers.api_football import ApiFootball
from .providers.football_data_org import FootballDataOrg
from .scheduler import Scheduler, load_schedule
from .validators import validate

PROVIDERS = {"football-data.org": FootballDataOrg, "api-football": ApiFootball}


def _conn(a):
    c = dbm.connect(a.db)
    dbm.migrate(c)
    return c


def cmd_migrate(a):
    c = dbm.connect(a.db)
    print("uygulanan geçişler:", dbm.migrate(c) or "yok (güncel)")


def cmd_providers(a):
    for code, cls in PROVIDERS.items():
        print(f"{code}: yetenekler={sorted(cls.capabilities)} canlı-doğrulandı={cls.VERIFIED_AGAINST_LIVE_API}")


def _importer(a, c):
    return Importer(c, PROVIDERS[a.provider].from_env(cache_path=a.cache))


def cmd_import(a):
    c = _conn(a)
    s = _importer(a, c).import_league(a.league, a.season)
    print(json.dumps(s.__dict__, ensure_ascii=False, indent=2, default=str))
    return 0 if s.status != "failed" else 1


def cmd_refresh(a):
    c = _conn(a)
    s = _importer(a, c).refresh(a.step, a.league, a.season)
    print(json.dumps(s.__dict__, ensure_ascii=False, indent=2, default=str))
    return 0 if s.status != "failed" else 1


def cmd_run_due(a):
    c = _conn(a)
    res = Scheduler(c, load_schedule(a.schedule)).run_due(_importer(a, c), a.league, a.season)
    print(json.dumps({k: (v.__dict__ if hasattr(v, "__dict__") else v) for k, v in res.items()}, ensure_ascii=False, indent=2, default=str))


def cmd_validate(a):
    rep = validate(_conn(a))
    print(json.dumps(rep, ensure_ascii=False, indent=2))
    return 0 if rep["ok"] else 1


def cmd_report(a):
    c = _conn(a)
    for j in c.execute("SELECT * FROM import_jobs ORDER BY id DESC LIMIT ?", (a.limit,)):
        print(f"#{j['id']} {j['job_type']} {j['scope']} {j['status']} görülen={j['records_seen']} yeni={j['records_created']} "
              f"güncel={j['records_updated']} değişmeyen={j['records_unchanged']} hata={j['errors_count']}")
        for e in c.execute("SELECT severity,message FROM import_errors WHERE import_job_id=? LIMIT 20", (j["id"],)):
            print(f"    [{e['severity']}] {e['message']}")


def cmd_publish(a):
    """Doğrulanmış bir anlık görüntü (snapshot) üretir ve yeni oyun veritabanı sürümü olarak kaydeder."""
    c = _conn(a)
    rep = validate(c)
    if not rep["ok"]:
        print("Yayın reddedildi, doğrulama hataları:", *rep["errors"], sep="\n  ")
        return 1
    blocked = [r[0] for r in c.execute("SELECT code FROM data_sources WHERE COALESCE(allows_redistribution,0) != 1")]
    if a.for_distribution and blocked:
        print("Dağıtım için yayın reddedildi: şu kaynakların yeniden dağıtım hakkı doğrulanmadı (data_sources.allows_redistribution):",
              *blocked, sep="\n  ")
        return 1
    rep["redistributable"] = not blocked
    rep["non_redistributable_sources"] = blocked
    cur = c.execute("SELECT COALESCE(MAX(version),0) FROM game_database_versions").fetchone()[0]
    version = cur + 1
    out = Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    snap = out / f"fmdata_v{version}.sqlite"
    if snap.exists():
        snap.unlink()
    c.execute("VACUUM INTO ?", (str(snap),))
    prev = c.execute("SELECT version FROM game_database_versions WHERE is_current=1").fetchone()
    c.execute("UPDATE game_database_versions SET is_current=0 WHERE is_current=1")
    c.execute("INSERT INTO game_database_versions(version,created_at,description,snapshot_path,record_counts_json,validation_report_json,is_current,parent_version) VALUES (?,?,?,?,?,?,1,?)",
              (version, dbm.utcnow(), a.description, str(snap), json.dumps(rep["counts"]), json.dumps(rep, ensure_ascii=False), prev[0] if prev else None))
    print(f"sürüm {version} yayınlandı: {snap}" + ("" if not blocked else "  [YALNIZCA DAHİLİ KULLANIM: yeniden dağıtım hakkı doğrulanmamış kaynak içerir]"))


def cmd_rollback(a):
    c = _conn(a)
    cur = c.execute("SELECT version, parent_version FROM game_database_versions WHERE is_current=1").fetchone()
    if not cur or cur["parent_version"] is None:
        print("Geri dönülecek önceki sürüm yok.")
        return 1
    c.execute("UPDATE game_database_versions SET is_current=0 WHERE is_current=1")
    c.execute("UPDATE game_database_versions SET is_current=1 WHERE version=?", (cur["parent_version"],))
    snap = c.execute("SELECT snapshot_path FROM game_database_versions WHERE version=?", (cur["parent_version"],)).fetchone()[0]
    print(f"geri dönüldü: sürüm {cur['parent_version']} ({snap})")


def build_parser():
    p = argparse.ArgumentParser(prog="fmdata")
    p.add_argument("--db", default="fmdata.sqlite")
    p.add_argument("--cache", default="fmdata_http_cache.sqlite")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("migrate").set_defaults(fn=cmd_migrate)
    sub.add_parser("providers").set_defaults(fn=cmd_providers)
    for name, fn in (("import", cmd_import), ("run-due", cmd_run_due)):
        s = sub.add_parser(name)
        s.add_argument("--provider", choices=PROVIDERS, required=True)
        s.add_argument("--league", required=True, help="sağlayıcının lig kodu/kimliği")
        s.add_argument("--season", required=True, help="örn. 2026-27")
        if name == "run-due":
            s.add_argument("--schedule", help="zamanlama JSON dosyası (varsayılanları geçersiz kılar)")
        s.set_defaults(fn=fn)
    r = sub.add_parser("refresh")
    r.add_argument("step", choices=["squads", "transfers", "injuries", "suspensions"])
    r.add_argument("--provider", choices=PROVIDERS, required=True)
    r.add_argument("--league", required=True)
    r.add_argument("--season", required=True)
    r.set_defaults(fn=cmd_refresh)
    sub.add_parser("validate").set_defaults(fn=cmd_validate)
    rp = sub.add_parser("report")
    rp.add_argument("--limit", type=int, default=5)
    rp.set_defaults(fn=cmd_report)
    pb = sub.add_parser("publish")
    pb.add_argument("--out-dir", default="dist")
    pb.add_argument("--description", default="")
    pb.add_argument("--for-distribution", action="store_true",
                    help="oyun paketine konulacak sürüm: yeniden dağıtım hakkı doğrulanmamış kaynak varsa reddedilir")
    pb.set_defaults(fn=cmd_publish)
    sub.add_parser("rollback").set_defaults(fn=cmd_rollback)
    return p


def main(argv=None):
    a = build_parser().parse_args(argv)
    try:
        sys.exit(a.fn(a) or 0)
    except RuntimeError as e:
        print("Hata:", e, file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
