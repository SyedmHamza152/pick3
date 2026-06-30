"""Update existing public_ids to remove leading zeros (e.g., LOT000012 -> LOT12)."""
import os
import sys
from pathlib import Path

# backend/
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sqlalchemy import create_engine, text
from app.config import settings


def main() -> None:
    engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True)
    
    with engine.begin() as conn:
        # Update all public_ids from LOT000012 format to LOT12 format
        result = conn.execute(text("""
            UPDATE users 
            SET public_id = 'LOT' || SUBSTRING(public_id FROM 4)::text::integer::text
            WHERE public_id LIKE 'LOT%'
        """))
        
        print(f"OK — Updated {result.rowcount} public_id(s) to remove leading zeros")


if __name__ == "__main__":
    main()
