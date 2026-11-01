#!/usr/bin/env python3
"""Kesinleştirilmiş veritabanı sürümünün özet ve doğrulama aracı.

  python3 data/db/manifest_tool.py build   -> data/db/DATABASE.json yazar (yalnızca sürüm kesinleştirirken)
  python3 data/db/manifest_tool.py verify  -> dosyaları manifestle karşılaştırır; fark varsa 1 ile çıkar
"""
import hashlib, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data" / "db" / "DATABASE.json"
FILES = lambda: sorted(
    [p for p in (ROOT / "data" / "world").rglob("*.gz")]
    + [p for p in (ROOT / "data" / "real_memory").glob("*.json")]
    + [p for p in (ROOT / "data" / "real_web").glob("*.json")]
    + [p for p in (ROOT / "data" / "names").glob("*.json")]
    + [ROOT / "design" / "VeriEditoru.dc.html"]
)


def sha(p: pathlib.Path) -> str:
    h = hashlib.sha256()
    h.update(p.read_bytes())
    return h.hexdigest()


def build() -> None:
    files = {str(p.relative_to(ROOT)): sha(p) for p in FILES()}
    top = hashlib.sha256(json.dumps(files, sort_keys=True).encode()).hexdigest()
    man = {
        "id": "varsayilan-v1",
        "ad": "Varsayılan Veritabanı",
        "surum": "1.0",
        "durum": "kesin",
        "tarih": "2026-11-01",
        "icerik": {"kulup": 7053, "oyuncu": 174038, "personel": 81959, "temsilci": 77},
        "not": "Oyuncu/personel üretilmiş (kurgusal) kayıtlardır; Süper Lig'de bellekten yazılan gerçek kişiler ayrıca işaretlidir. "
               "Web aramasıyla toplanan ve bellekten yazılan alanlar doğrulanmamıştır.",
        "ozet": top,
        "dosyalar": files,
    }
    MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1), encoding="utf-8")
    print("yazıldı:", MANIFEST, "·", len(files), "dosya · özet", top[:16])


def verify() -> int:
    man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    bad = []
    for rel, h in man["dosyalar"].items():
        p = ROOT / rel
        if not p.exists():
            bad.append(("eksik", rel))
        elif sha(p) != h:
            bad.append(("değişmiş", rel))
    cur = {str(p.relative_to(ROOT)) for p in FILES()}
    for rel in sorted(cur - set(man["dosyalar"])):
        bad.append(("yeni (manifestte yok)", rel))
    for b in bad:
        print(*b)
    print("TAMAM · veritabanı kesin sürümle aynı" if not bad else "FARK VAR: %d dosya" % len(bad))
    return 1 if bad else 0


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "verify"
    if cmd == "build":
        build()
    else:
        sys.exit(verify())
