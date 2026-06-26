from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from decimal import Decimal, InvalidOperation
from pathlib import Path
import uuid, os
from ..database import get_db
from ..models import User, Deposit
from ..config import settings
from ..currency import pkr_to_riyal
from ..security import get_current_user
from ..schemas import BalanceOut, CurrencyOut
from ..uploads import ALLOWED_EXT, upload_dir

router = APIRouter(prefix="/api/deposits", tags=["deposits"])


@router.get("/currency", response_model=CurrencyOut)
def currency_info():
    return CurrencyOut(
        pkr_per_riyal=settings.PKR_PER_RIYAL,
        straight_prize_multiplier=settings.STRAIGHT_PRIZE_MULTIPLIER,
        rumble_prize_multiplier=settings.RUMBLE_PRIZE_MULTIPLIER,
    )


@router.post("/", status_code=201)
async def submit_deposit(
    amount: str = Form(..., description="Deposit amount in PKR"),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        amount_pkr = Decimal(amount.strip())
    except (InvalidOperation, AttributeError):
        raise HTTPException(400, "Invalid amount")
    if amount_pkr <= 0:
        raise HTTPException(400, "Amount must be greater than zero")
    ext = Path(screenshot.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Only PNG/JPG/JPEG/WEBP allowed")
    data = await screenshot.read()
    if len(data) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(400, f"File exceeds {settings.MAX_UPLOAD_MB}MB")
    fname = f"{uuid.uuid4().hex}{ext}"
    fpath = upload_dir() / fname
    with open(str(fpath), "wb") as f:
        f.write(data)
    dep = Deposit(user_id=user.user_id, amount=amount_pkr, screenshot_path=fname)
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return {
        "deposit_id": dep.deposit_id,
        "status": dep.status,
        "amount_pkr": float(dep.amount),
        "amount_riyal": float(pkr_to_riyal(dep.amount)),
    }


@router.get("/mine")
def my_deposits(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(Deposit)
        .filter(Deposit.user_id == user.user_id)
        .order_by(Deposit.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "deposit_id": d.deposit_id,
            "amount_pkr": float(d.amount),
            "amount_riyal": float(pkr_to_riyal(d.amount)),
            "status": d.status,
            "created_at": d.created_at.isoformat(),
        }
        for d in rows
    ]


@router.get("/balance", response_model=BalanceOut)
def my_balance(user: User = Depends(get_current_user)):
    return BalanceOut(account_balance=user.account_balance)
