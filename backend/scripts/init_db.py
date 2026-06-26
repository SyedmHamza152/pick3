"""Apply db/schema.sql to the database in DATABASE_URL (Neon or any PostgreSQL)."""
import os
import sys
from pathlib import Path

# backend/
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sqlalchemy import create_engine, text
from app.config import settings

SCHEMA = ROOT.parent / "db" / "schema.sql"


def main() -> None:
    if not SCHEMA.is_file():
        raise SystemExit(f"Schema not found: {SCHEMA}")
    sql = SCHEMA.read_text(encoding="utf-8")
    engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True)
    with engine.begin() as conn:
        conn.execute(text(sql))
    print(f"OK — schema applied to {settings.DATABASE_URL.split('@')[-1]}")


if __name__ == "__main__":
    main()
