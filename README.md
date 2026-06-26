# 3-Number Lottery — Full-Stack App

**Stack:** FastAPI + Neon PostgreSQL + vanilla HTML/CSS/JS (single deployable app).

| | |
|---|---|
| **Run locally** | `.\run.ps1` or see below |
| **Deploy live** | **[DEPLOY.md](DEPLOY.md)** — GitHub → Render/Railway + free domain |

## Project structure (GitHub-ready)

```
lottery/
├── Dockerfile, render.yaml, railway.toml   # deploy configs
├── DEPLOY.md                               # go-live guide
├── db/schema.sql
├── backend/app/          # API
├── backend/scripts/      # init_db.py
└── frontend/             # pages (served at /)
```

## Quick start (local)

1. **Neon DB** — set `DATABASE_URL` in `backend/.env` (see `backend/.env.example`).
2. **Init DB once:** `cd backend` → `python scripts/init_db.py`
3. **Run:** from `backend` folder → `.\start.ps1` (opens index + auto-reload)

Default admin: `admin` / `admin123`

## Manual local run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env   # edit DATABASE_URL
.\start.ps1
# or: .\.venv\Scripts\python.exe run_dev.py
```

Open **http://127.0.0.1:8000/** (not the HTML file on disk).

## Deploy to production

Push this repo to GitHub, then follow **[DEPLOY.md](DEPLOY.md)** for Render (free) or Railway, Neon, and a custom domain.

## Features

- User signup/login, wallet, deposits (screenshot), lottery tickets (straight/rumble)
- Admin: deposits, winners, wallet adjust, clear screenshots
- All persistent data in **Neon**; screenshots on server disk (`backend/uploads/`)
