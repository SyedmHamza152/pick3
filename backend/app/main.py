from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware import Middleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from .config import settings
from .database import Base, engine
from .routes import auth, deposits, tickets, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    url = settings.public_url or f"http://127.0.0.1:{settings.PORT}/"
    print(f"\n  Backend API running at:\n  {url}")
    print(f"  Frontend served from same URL\n")
    yield


app = FastAPI(title="Lottery API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create tables if missing (also run db/schema.sql once for admin seed + constraints)
Base.metadata.create_all(bind=engine)
upload_path = Path(settings.UPLOAD_DIR)
if not upload_path.is_absolute():
    upload_path = Path(__file__).resolve().parents[1] / upload_path
upload_path.mkdir(parents=True, exist_ok=True)

# Mount static frontend files
frontend_path = Path(__file__).resolve().parents[2] / "frontend" / "out"

# Also check the Docker build path
if not frontend_path.exists():
    frontend_path = Path("/app/frontend/out")

print(f"Frontend path: {frontend_path}")
print(f"Frontend path exists: {frontend_path.exists()}")

app.include_router(auth.router)
app.include_router(deposits.router)
app.include_router(tickets.router)
app.include_router(admin.router)

@app.get("/api/health")
def health():
    return {"ok": True}

# Serve frontend - must be after API routes
if frontend_path.exists():
    # Serve static files
    app.mount("/_next", StaticFiles(directory=str(frontend_path / "_next")), name="next")
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str = ""):
        if not full_path or full_path == "/":
            return FileResponse(frontend_path / "index.html")
        file_path = frontend_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_path / "index.html")
else:
    # Fallback if frontend build is missing
    @app.get("/", include_in_schema=False)
    async def serve_root():
        return {"error": "Frontend build not found. Please check deployment logs."}
