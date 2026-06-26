# Deploy to production (GitHub → free hosting + custom domain)

This repo is one **monorepo**: FastAPI serves the API and the `frontend/` files on the same URL. Database is **Neon PostgreSQL** (already cloud).

## Repo layout (upload this structure to GitHub)

```
lottery/
├── Dockerfile              ← production server image
├── render.yaml             ← one-click Render deploy
├── railway.toml            ← Railway deploy
├── docker-compose.yml      ← test production locally
├── DEPLOY.md               ← this file
├── README.md
├── db/schema.sql
├── backend/
│   ├── app/                ← Python API
│   ├── requirements.txt
│   ├── .env.example        ← copy for local dev only
│   └── scripts/init_db.py
└── frontend/               ← HTML/CSS/JS (served by FastAPI)
```

**Do not commit** `backend/.env` or `backend/.venv/` (already in `.gitignore`).

---

## Step 1 — Push to GitHub

```bash
cd lottery
git init
git add .
git commit -m "Lottery app ready for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

---

## Step 2 — Neon database (you already have this)

1. [Neon](https://neon.tech) → your project → **Connection string** (pooler URL recommended).
2. Copy the URL. It may look like:
   `postgresql://user:pass@host/neondb?sslmode=require`
3. The app converts it automatically to `postgresql+psycopg2://...` for SQLAlchemy.

**First time only** — create tables + admin user (from your PC):

```bash
cd backend
# set DATABASE_URL in .env to your Neon URL, then:
.\.venv\Scripts\python.exe scripts\init_db.py
```

Default admin: `admin` / `admin123` — change after first login.

---

## Step 3 — Deploy on Render (recommended, free tier)

1. Go to [render.com](https://render.com) → **Sign up** → connect **GitHub**.
2. **New** → **Blueprint** → select this repo (Render reads `render.yaml`).
   - Or **New Web Service** → repo → **Docker** → Dockerfile path `./Dockerfile`.
3. **Environment variables** (Settings → Environment):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `ENVIRONMENT` | `production` |
| `APP_PUBLIC_URL` | `https://YOUR-SERVICE.onrender.com` (update after first deploy) |

`RENDER_EXTERNAL_URL` is set automatically; `APP_PUBLIC_URL` is needed for CORS if you use a **custom domain**.

4. **Deploy**. When live, open `https://your-service.onrender.com/` — that is your `index.html`.

5. **Custom domain** (optional): Render → your service → **Settings** → **Custom Domains** → add `www.yourdomain.com` → add the CNAME at your DNS provider (Namecheap, Cloudflare, etc.).

6. Set `APP_PUBLIC_URL=https://www.yourdomain.com` and redeploy.

**Note:** Free Render spins down when idle; first visit may take ~30s. Deposit screenshots are stored on disk and **may reset** on redeploy unless you add a [Render persistent disk](https://render.com/docs/disks).

---

## Step 4 — Alternative: Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → this repo.
2. Uses `Dockerfile` via `railway.toml`.
3. Add the same env vars as in the table above.
4. **Settings** → **Networking** → generate domain → set `APP_PUBLIC_URL` to that HTTPS URL.

---

## Step 5 — Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL URL |
| `JWT_SECRET` | Yes | Secret for login tokens (never commit) |
| `ENVIRONMENT` | Prod | Set to `production` on server |
| `APP_PUBLIC_URL` | Recommended | `https://yourdomain.com` (no trailing slash) |
| `CORS_ORIGINS` | Optional | Extra origins, comma-separated |
| `UPLOAD_DIR` | Optional | Default `./uploads` |
| `PORT` | Auto | Set by Render/Railway/Docker |

---

## Test production build locally

```bash
# Copy env
cp backend/.env.example backend/.env   # edit DATABASE_URL

docker compose up --build
# Open http://localhost:8000/
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login “Failed to fetch” | Open the **https://** site from the server, not `file://` HTML |
| 502 / app won’t start | Check `DATABASE_URL` and logs; Neon must allow connections |
| CORS error | Set `APP_PUBLIC_URL` to your exact public HTTPS URL |
| No admin user | Run `python backend/scripts/init_db.py` once against Neon |

---

## Security checklist before going live

- [ ] Change admin password from `admin123`
- [ ] Set a strong `JWT_SECRET` on the server
- [ ] Rotate Neon password if it was ever shared
- [ ] Use HTTPS only (hosting providers do this automatically)
