import os
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List

_BACKEND_DIR = Path(__file__).resolve().parent.parent


def normalize_database_url(url: str) -> str:
    """Accept Neon/Heroku URLs and ensure SQLAlchemy uses psycopg2."""
    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://") :]
    elif url.startswith("postgresql://") and "+" not in url.split("://", 1)[0]:
        url = "postgresql+psycopg2://" + url[len("postgresql://") :]
    return url


class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., description="Neon PostgreSQL URL")
    JWT_SECRET: str = "change-me-to-a-long-random-string"
    JWT_ALG: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 720
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_MB: int = 5
    PKR_PER_RIYAL: int = 75
    STRAIGHT_PRIZE_MULTIPLIER: int = 400
    RUMBLE_PRIZE_MULTIPLIER: int = 80
    CORS_ORIGINS: str = ""
    # Set to https://yourdomain.com after deploy (optional — Render/Railway auto-detected)
    APP_PUBLIC_URL: str = ""
    ENVIRONMENT: str = "development"
    PORT: int = 8000

    class Config:
        env_file = str(_BACKEND_DIR / ".env")
        env_file_encoding = "utf-8"

    @property
    def sqlalchemy_database_url(self) -> str:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def public_url(self) -> str:
        if self.APP_PUBLIC_URL.strip():
            return self.APP_PUBLIC_URL.strip().rstrip("/")
        render_url = os.getenv("RENDER_EXTERNAL_URL", "").strip()
        if render_url:
            return render_url.rstrip("/")
        railway = os.getenv("RAILWAY_PUBLIC_DOMAIN", "").strip()
        if railway:
            host = railway if railway.startswith("http") else f"https://{railway}"
            return host.rstrip("/")
        fly = os.getenv("FLY_APP_NAME", "").strip()
        if fly:
            return f"https://{fly}.fly.dev"
        return ""

    @property
    def cors_origins(self) -> List[str]:
        local = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]
        extra = [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]
        pub = self.public_url
        if pub:
            extra.append(pub)
        return list(dict.fromkeys(local + extra))

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()
