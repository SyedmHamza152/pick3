from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routes import auth, deposits, tickets, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    url = settings.public_url or f"http://127.0.0.1:{settings.PORT}/"
    print(f"\n  Backend API running at:\n  {url}")
    print(f"  Frontend should run at http://localhost:3000\n")
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

app.include_router(auth.router)
app.include_router(deposits.router)
app.include_router(tickets.router)
app.include_router(admin.router)

@app.get("/api/health")
def health():
    return {"ok": True}
