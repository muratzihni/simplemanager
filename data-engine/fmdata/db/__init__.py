"""SQLite bağlantısı ve sürümlü şema geçişleri (migration)."""
from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def connect(path: str | Path = ":memory:") -> sqlite3.Connection:
    conn = sqlite3.connect(str(path), isolation_level=None)  # işlemleri biz yönetiriz
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    if str(path) != ":memory:":
        conn.execute("PRAGMA journal_mode = WAL")
    return conn


def _applied(conn: sqlite3.Connection) -> set[int]:
    conn.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)")
    return {r[0] for r in conn.execute("SELECT version FROM schema_migrations")}


def migrate(conn: sqlite3.Connection) -> list[int]:
    """Bekleyen geçişleri sırayla, her biri tek işlemde uygular. Uygulananların sürümlerini döndürür."""
    done = _applied(conn)
    applied: list[int] = []
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        version = int(f.name.split("_", 1)[0])
        if version in done:
            continue
        script = f.read_text(encoding="utf-8")
        try:
            conn.execute("BEGIN")
            for stmt in _split_statements(script):
                conn.execute(stmt)
            conn.execute("INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)", (version, utcnow()))
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
        applied.append(version)
    return applied


def _split_statements(script: str) -> list[str]:
    """Tetikleyici gövdelerindeki ';' işaretlerini bölmeden ifadeleri ayırır."""
    stmts, buf = [], []
    for line in script.splitlines():
        if line.strip().startswith("--") and not buf:
            continue
        buf.append(line)
        candidate = "\n".join(buf).strip()
        if candidate.endswith(";") and sqlite3.complete_statement(candidate):
            stmts.append(candidate)
            buf = []
    tail = "\n".join(buf).strip()
    if tail:
        stmts.append(tail)
    return stmts


def get_or_create_source(conn: sqlite3.Connection, code: str, name: str, base_url: str | None = None,
                         license_note: str | None = None, allows_redistribution: int | None = None) -> int:
    row = conn.execute("SELECT id FROM data_sources WHERE code = ?", (code,)).fetchone()
    if row:
        return row[0]
    cur = conn.execute(
        "INSERT INTO data_sources(code, name, base_url, license_note, allows_redistribution, created_at) VALUES (?,?,?,?,?,?)",
        (code, name, base_url, license_note, allows_redistribution, utcnow()))
    return cur.lastrowid
