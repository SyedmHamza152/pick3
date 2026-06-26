"""Deposit screenshot files on disk (not stored in PostgreSQL)."""
from pathlib import Path
from fastapi import HTTPException
from .config import settings

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp"}


def upload_dir() -> Path:
    p = Path(settings.UPLOAD_DIR).resolve()
    p.mkdir(parents=True, exist_ok=True)
    return p


def safe_upload_path(filename: str) -> Path:
    base = upload_dir()
    path = (base / Path(filename).name).resolve()
    if base not in path.parents and path != base:
        raise HTTPException(400, "Invalid file path")
    return path


def is_upload_file(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in ALLOWED_EXT


def list_upload_files() -> list[Path]:
    base = upload_dir()
    if not base.is_dir():
        return []
    return [p for p in base.iterdir() if is_upload_file(p)]


def delete_upload_file(filename: str) -> bool:
    path = safe_upload_path(filename)
    if path.is_file():
        path.unlink()
        return True
    return False


def clear_all_upload_files() -> int:
    deleted = 0
    for path in list_upload_files():
        path.unlink()
        deleted += 1
    return deleted
