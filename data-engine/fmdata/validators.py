"""Veri bütünlüğü ve tutarlılık raporu. 'errors' yayınlamayı engeller; 'warnings' bilgi içindir."""
from __future__ import annotations

import sqlite3


def validate(conn: sqlite3.Connection) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    fk = conn.execute("PRAGMA foreign_key_check").fetchall()
    if fk:
        errors.append(f"{len(fk)} yabancı anahtar ihlali")
    ic = conn.execute("PRAGMA integrity_check").fetchone()[0]
    if ic != "ok":
        errors.append(f"SQLite bütünlük kontrolü: {ic}")
    bad_loans = conn.execute(
        "SELECT l.id FROM loan_agreements l WHERE l.status='active' AND NOT EXISTS ("
        " SELECT 1 FROM club_squads c WHERE c.player_id=l.player_id AND c.club_id=l.loan_club_id AND c.status='active' AND c.valid_to IS NULL)").fetchall()
    if bad_loans:
        errors.append(f"{len(bad_loans)} aktif kiralıkta oyuncu kiralayan kulübün aktif kadrosunda değil")
    bad_out = conn.execute(
        "SELECT l.id FROM loan_agreements l WHERE l.status='active' AND NOT EXISTS ("
        " SELECT 1 FROM club_squads c WHERE c.player_id=l.player_id AND c.club_id=l.parent_club_id AND c.status='on_loan_out' AND c.valid_to IS NULL)").fetchall()
    if bad_out:
        errors.append(f"{len(bad_out)} aktif kiralıkta bonservis sahibi kulüpte 'kiralıkta' kaydı yok")
    dbl = conn.execute("SELECT player_id FROM club_squads WHERE status='active' AND valid_to IS NULL GROUP BY player_id HAVING COUNT(*)>1").fetchall()
    if dbl:
        errors.append(f"{len(dbl)} oyuncu aynı anda birden fazla aktif kadroda")
    no_dob = conn.execute("SELECT COUNT(*) FROM players WHERE birth_date IS NULL").fetchone()[0]
    if no_dob:
        warnings.append(f"{no_dob} oyuncuda doğum tarihi eksik")
    conflicts = conn.execute("SELECT COUNT(*) FROM players WHERE verification_status='conflict'").fetchone()[0]
    if conflicts:
        warnings.append(f"{conflicts} oyuncu kaydı 'conflict' (olası mükerrer) olarak işaretli")
    no_country = conn.execute("SELECT COUNT(*) FROM clubs WHERE country_id IS NULL").fetchone()[0]
    if no_country:
        warnings.append(f"{no_country} kulüpte ülke bilgisi yok")
    counts = {t: conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
              for t in ("countries", "competitions", "clubs", "players", "club_squads", "transfers", "loan_agreements",
                        "player_injuries", "player_suspensions", "managers")}
    return {"ok": not errors, "errors": errors, "warnings": warnings, "counts": counts}
