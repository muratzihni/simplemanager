"""Kadro üyeliği ve kiralık işlemleri.

Kural: bir oyuncunun aynı anda yalnızca BİR 'active' kadro kaydı olur (veritabanı da bunu zorlar).
Kiralıkta bonservis sahibi kulüpte 'on_loan_out' (aktif değil), oynadığı kulüpte 'active' kayıt tutulur.
"""
from __future__ import annotations

import sqlite3

from .db import utcnow


def open_active_row(conn: sqlite3.Connection, player_id: int):
    return conn.execute("SELECT * FROM club_squads WHERE player_id=? AND status='active' AND valid_to IS NULL", (player_id,)).fetchone()


def _close(conn, row, at_date: str) -> None:
    to = max(at_date, row["valid_from"])
    conn.execute("UPDATE club_squads SET valid_to=? WHERE id=?", (to, row["id"]))


def set_active_membership(conn, *, player_id: int, club_id: int, season_id: int | None, shirt_number: int | None,
                          from_date: str, source_id: int | None, squad_type: str = "first_team") -> str:
    """'unchanged' | 'updated' | 'opened' | 'moved' | 'blocked_by_loan'"""
    blocked = conn.execute(
        "SELECT 1 FROM loan_agreements WHERE player_id=? AND status='active' AND parent_club_id=? AND loan_club_id != ?",
        (player_id, club_id, club_id)).fetchone()
    if blocked:
        return "blocked_by_loan"
    now = utcnow()
    cur = open_active_row(conn, player_id)
    if cur and cur["club_id"] == club_id:
        if shirt_number is not None and cur["shirt_number"] != shirt_number:
            conn.execute("UPDATE club_squads SET shirt_number=?, last_checked_at=? WHERE id=?", (shirt_number, now, cur["id"]))
            return "updated"
        conn.execute("UPDATE club_squads SET last_checked_at=? WHERE id=?", (now, cur["id"]))
        return "unchanged"
    moved = False
    start = from_date
    if cur:
        _close(conn, cur, from_date)
        start = max(from_date, cur["valid_from"])
        moved = True
    last = conn.execute("SELECT MAX(valid_to) FROM club_squads WHERE player_id=? AND status='active'", (player_id,)).fetchone()[0]
    if last:
        start = max(start, last)
    conn.execute(
        "INSERT INTO club_squads(club_id,player_id,season_id,squad_type,shirt_number,status,valid_from,valid_to,source_id,verification_status,confidence,last_checked_at) "
        "VALUES (?,?,?,?,?,'active',?,NULL,?,'provider_reported',0.8,?)",
        (club_id, player_id, season_id, squad_type, shirt_number, start, source_id, now))
    return "moved" if moved else "opened"


def close_active_membership(conn, player_id: int, at_date: str) -> bool:
    cur = open_active_row(conn, player_id)
    if cur:
        _close(conn, cur, at_date)
        return True
    return False


def start_loan(conn, loan_id: int, season_id: int | None = None) -> None:
    """Kiralığı kadrolara yansıtır: sahibi kulüp 'on_loan_out', kiralayan kulüp 'active'."""
    loan = conn.execute("SELECT * FROM loan_agreements WHERE id=?", (loan_id,)).fetchone()
    now = utcnow()
    cur = open_active_row(conn, loan["player_id"])
    if cur and cur["club_id"] == loan["loan_club_id"]:
        pass
    else:
        if cur:
            _close(conn, cur, loan["start_date"])
        last = conn.execute("SELECT MAX(valid_to) FROM club_squads WHERE player_id=? AND status='active'", (loan["player_id"],)).fetchone()[0]
        start = max(loan["start_date"], last or loan["start_date"])
        conn.execute(
            "INSERT INTO club_squads(club_id,player_id,season_id,squad_type,status,valid_from,source_id,verification_status,confidence,last_checked_at) "
            "VALUES (?,?,?,'first_team','active',?,?, 'provider_reported',0.8,?)",
            (loan["loan_club_id"], loan["player_id"], season_id, start, loan["source_id"], now))
    has_out = conn.execute("SELECT 1 FROM club_squads WHERE club_id=? AND player_id=? AND status='on_loan_out' AND valid_to IS NULL",
                           (loan["parent_club_id"], loan["player_id"])).fetchone()
    if not has_out:
        conn.execute(
            "INSERT INTO club_squads(club_id,player_id,season_id,squad_type,status,valid_from,source_id,verification_status,confidence,last_checked_at) "
            "VALUES (?,?,?,'first_team','on_loan_out',?,?,'provider_reported',0.8,?)",
            (loan["parent_club_id"], loan["player_id"], season_id, loan["start_date"], loan["source_id"], now))
    conn.execute("UPDATE loan_agreements SET status='active' WHERE id=?", (loan_id,))


def end_loan(conn, loan_id: int, end_date: str, status: str = "ended", season_id: int | None = None) -> None:
    loan = conn.execute("SELECT * FROM loan_agreements WHERE id=?", (loan_id,)).fetchone()
    now = utcnow()
    cur = open_active_row(conn, loan["player_id"])
    if cur and cur["club_id"] == loan["loan_club_id"]:
        _close(conn, cur, end_date)
    out = conn.execute("SELECT * FROM club_squads WHERE club_id=? AND player_id=? AND status='on_loan_out' AND valid_to IS NULL",
                       (loan["parent_club_id"], loan["player_id"])).fetchone()
    if out:
        _close(conn, out, end_date)
    if not open_active_row(conn, loan["player_id"]):
        last = conn.execute("SELECT MAX(valid_to) FROM club_squads WHERE player_id=? AND status='active'", (loan["player_id"],)).fetchone()[0]
        conn.execute(
            "INSERT INTO club_squads(club_id,player_id,season_id,squad_type,status,valid_from,source_id,verification_status,confidence,last_checked_at) "
            "VALUES (?,?,?,'first_team','active',?,?,'provider_reported',0.8,?)",
            (loan["parent_club_id"], loan["player_id"], season_id, max(end_date, last or end_date), loan["source_id"], now))
    conn.execute("UPDATE loan_agreements SET status=?, end_date=COALESCE(end_date, ?) WHERE id=?", (status, end_date, loan_id))


def squad_at(conn, club_id: int, on_date: str):
    """O tarihte kulübün AKTİF kadrosu (kiralıktaki oyuncular sahibi kulüpte listelenmez)."""
    return conn.execute(
        "SELECT cs.*, p.full_name FROM club_squads cs JOIN players p ON p.id=cs.player_id "
        "WHERE cs.club_id=? AND cs.status='active' AND cs.valid_from<=? AND (cs.valid_to IS NULL OR cs.valid_to>?) ORDER BY cs.shirt_number, p.full_name",
        (club_id, on_date, on_date)).fetchall()
