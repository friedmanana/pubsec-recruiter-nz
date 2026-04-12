"""Auto-migration runner.

Connects directly to Supabase PostgreSQL via DATABASE_URL and applies any
SQL migration files in backend/db/migrations/ that haven't been run yet.

Tracks applied migrations in a `schema_migrations` table.
Called automatically at FastAPI startup — safe to run on every deploy.
"""

from __future__ import annotations

import os
import re
from pathlib import Path


def _get_database_url() -> str | None:
    return os.getenv("DATABASE_URL", "").strip() or None


def run_migrations() -> None:
    """Apply all pending migrations.  Silently skips if DATABASE_URL is not set."""
    db_url = _get_database_url()
    if not db_url:
        print("[migrate] DATABASE_URL not set — skipping auto-migration")
        return

    try:
        import psycopg2  # type: ignore[import]
    except ImportError:
        print("[migrate] psycopg2 not installed — skipping auto-migration")
        return

    migrations_dir = Path(__file__).parent / "migrations"
    sql_files = sorted(
        f for f in migrations_dir.glob("*.sql")
        if re.match(r"^\d+_", f.name)  # only numbered files e.g. 002_comms.sql
    )

    if not sql_files:
        print("[migrate] No migration files found")
        return

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
        cur = conn.cursor()

        # Create tracking table if needed
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename   TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
        conn.commit()

        # Fetch already-applied migrations
        cur.execute("SELECT filename FROM schema_migrations")
        applied = {row[0] for row in cur.fetchall()}

        pending = [f for f in sql_files if f.name not in applied]
        if not pending:
            print(f"[migrate] All {len(sql_files)} migration(s) already applied — nothing to do")
            cur.close()
            conn.close()
            return

        for sql_file in pending:
            print(f"[migrate] Applying {sql_file.name} …")
            sql = sql_file.read_text(encoding="utf-8")
            try:
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s)",
                    (sql_file.name,),
                )
                conn.commit()
                print(f"[migrate] ✓ {sql_file.name}")
            except Exception as exc:
                conn.rollback()
                print(f"[migrate] ✗ {sql_file.name} failed: {exc}")
                # Continue with other migrations rather than hard-crashing startup

        cur.close()
        conn.close()
        print("[migrate] Done")

    except Exception as exc:
        print(f"[migrate] Connection failed — skipping migrations: {exc}")
