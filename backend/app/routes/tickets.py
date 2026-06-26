from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from decimal import Decimal
from ..database import get_db
from ..models import User, LotteryTicket, Winner
from ..schemas import TicketIn, TicketOut, WinnerOut
from ..security import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["tickets"])

@router.post("/", response_model=TicketOut, status_code=201)
def buy_ticket(data: TicketIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    wager = Decimal(data.amount_wagered)
    # 43% cashback: only deduct 57% of the wager
    actual_deduction = wager * Decimal("0.57")
    # Atomic balance deduction
    refreshed = db.query(User).filter(User.user_id == user.user_id).with_for_update().one()
    if refreshed.account_balance < actual_deduction:
        raise HTTPException(400, "Insufficient balance")
    refreshed.account_balance = refreshed.account_balance - actual_deduction
    ticket = LotteryTicket(
        user_id=refreshed.user_id,
        n1=data.n1, n2=data.n2, n3=data.n3,
        ticket_type=data.ticket_type,
        amount_wagered=wager,
    )
    db.add(ticket); db.commit(); db.refresh(ticket)
    return ticket

@router.get("/mine", response_model=list[TicketOut])
def my_tickets(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(LotteryTicket).filter(LotteryTicket.user_id == user.user_id)\
        .order_by(LotteryTicket.created_at.desc()).limit(20).all()

@router.get("/winners", response_model=list[WinnerOut])
def list_winners(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(Winner, User.username, User.public_id).join(
        User, User.user_id == Winner.user_id
    ).order_by(Winner.announced_date.desc()).limit(20).all()
    return [
        WinnerOut(
            winner_id=w.winner_id,
            user_id=w.user_id,
            public_id=pid,
            username=uname,
            w1=w.w1,
            w2=w.w2,
            w3=w.w3,
            ticket_type=w.ticket_type,
            prize_amount=w.prize_amount,
            announced_date=w.announced_date,
        )
        for w, uname, pid in rows
    ]
