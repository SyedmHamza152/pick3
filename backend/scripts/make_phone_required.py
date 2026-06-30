"""Make phone column NOT NULL and handle existing NULL values."""
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
        # First, update any existing NULL phone numbers to unique placeholders based on user_id
        result = conn.execute(text("""
            UPDATE users 
            SET phone = 'TEMP' || LPAD(user_id::text, 10, '0')
            WHERE phone IS NULL
        """))
        print(f"Updated {result.rowcount} users with NULL phone to unique placeholders")
        
        # Then alter the column to NOT NULL
        conn.execute(text("""
            ALTER TABLE users 
            ALTER COLUMN phone SET NOT NULL
        """))
        print("OK — phone column is now NOT NULL")


if __name__ == "__main__":
    main()
