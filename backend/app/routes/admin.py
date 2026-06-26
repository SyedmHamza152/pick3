from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from datetime import datetime, timezone, date, timedelta
from decimal import Decimal
from pathlib import Path
import os
from typing import Optional
from ..database import get_db
from ..models import User, Deposit, LotteryTicket, Winner
from ..schemas import (
    WinnerIn,
    WinnerOut,
    AnnounceWinnersOut,
    DepositRequestOut,
    AdminUserSummary,
    AdminUserDetail,
    AdminUserDepositOut,
    AdminUserTicketOut,
    AdminUserWinOut,
    AdminBalanceAdjustIn,
    AdminBalanceLookupOut,
    AdminBalanceAdjustOut,
    AdminReportOut,
)
from ..security import require_admin
from ..config import settings
from ..currency import pkr_to_riyal, prize_for_wager
from ..uploads import safe_upload_path, list_upload_files, delete_upload_file, clear_all_upload_files

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ---------- Deposits ----------
@router.get("/deposits", response_model=list[DepositRequestOut])
def list_deposits(status: str = Query("pending", pattern="^(pending|approved|rejected|all)$"),
                  db: Session = Depends(get_db), _: User = Depends(require_admin)):
    q = db.query(Deposit, User.username, User.public_id).join(
        User, User.user_id == Deposit.user_id
    )
    if status != "all":
        q = q.filter(Deposit.status == status)
    rows = q.order_by(Deposit.created_at.desc()).all()
    return [
        DepositRequestOut(
            deposit_id=d.deposit_id,
            user_id=d.user_id,
            public_id=pid,
            username=uname,
            amount_pkr=d.amount,
            amount_riyal=pkr_to_riyal(d.amount),
            screenshot_path=d.screenshot_path,
            status=d.status,
            created_at=d.created_at,
        )
        for d, uname, pid in rows
    ]

@router.get("/deposits/{deposit_id}/screenshot")
def get_screenshot(deposit_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    dep = db.query(Deposit).filter(Deposit.deposit_id == deposit_id).first()
    if not dep:
        raise HTTPException(404, "Not found")
    path = safe_upload_path(dep.screenshot_path)
    if not path.is_file():
        raise HTTPException(404, "File missing")
    return FileResponse(path)

@router.get("/uploads/stats")
def uploads_stats(_: User = Depends(require_admin)):
    files = list_upload_files()
    total_bytes = sum(p.stat().st_size for p in files)
    return {"count": len(files), "total_bytes": total_bytes}


@router.delete("/uploads/deposit/{deposit_id}")
def delete_deposit_screenshot(
    deposit_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    dep = db.query(Deposit).filter(Deposit.deposit_id == deposit_id).first()
    if not dep:
        raise HTTPException(404, "Deposit not found")
    deleted = delete_upload_file(dep.screenshot_path)
    return {"ok": True, "deposit_id": deposit_id, "file_deleted": deleted}


@router.post("/uploads/clear-all")
def clear_all_uploads(_: User = Depends(require_admin)):
    deleted = clear_all_upload_files()
    return {"ok": True, "deleted": deleted}


@router.post("/deposits/{deposit_id}/approve")
def approve_deposit(deposit_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    dep = db.query(Deposit).filter(Deposit.deposit_id == deposit_id).with_for_update().first()
    if not dep:
        raise HTTPException(404, "Not found")
    if dep.status != "pending":
        raise HTTPException(400, f"Already {dep.status}")
    user = db.query(User).filter(User.user_id == dep.user_id).with_for_update().one()
    credit_riyal = pkr_to_riyal(dep.amount)
    user.account_balance = user.account_balance + credit_riyal
    dep.status = "approved"
    dep.reviewed_at = datetime.now(timezone.utc)
    dep.reviewed_by = admin.user_id
    db.commit()
    return {
        "ok": True,
        "credited_riyal": float(credit_riyal),
        "amount_pkr": float(dep.amount),
        "new_balance": float(user.account_balance),
    }

@router.post("/deposits/{deposit_id}/reject")
def reject_deposit(deposit_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    dep = db.query(Deposit).filter(Deposit.deposit_id == deposit_id).with_for_update().first()
    if not dep:
        raise HTTPException(404, "Not found")
    if dep.status != "pending":
        raise HTTPException(400, f"Already {dep.status}")
    dep.status = "rejected"
    dep.reviewed_at = datetime.now(timezone.utc)
    dep.reviewed_by = admin.user_id
    db.commit()
    return {"ok": True}

# ---------- Winners ----------
def _matches_rumble(t: LotteryTicket, w1: int, w2: int, w3: int) -> bool:
    return sorted([t.n1, t.n2, t.n3]) == sorted([w1, w2, w3])

def _matches_straight(t: LotteryTicket, w1: int, w2: int, w3: int) -> bool:
    return t.n1 == w1 and t.n2 == w2 and t.n3 == w3

def _other_ticket_type(ticket_type: str) -> str:
    return "rumble" if ticket_type == "straight" else "straight"

def _draw_type_announced(db: Session, w1: int, w2: int, w3: int, ticket_type: str) -> bool:
    return (
        db.query(Winner.winner_id)
        .filter(
            Winner.w1 == w1,
            Winner.w2 == w2,
            Winner.w3 == w3,
            Winner.ticket_type == ticket_type,
        )
        .first()
        is not None
    )

@router.post("/winners", response_model=AnnounceWinnersOut)
def announce_winners(data: WinnerIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if _draw_type_announced(db, data.w1, data.w2, data.w3, data.ticket_type):
        raise HTTPException(
            400,
            f"{data.ticket_type} winners already announced for {data.w1}{data.w2}{data.w3}",
        )

    other_type = _other_ticket_type(data.ticket_type)
    round_will_close = _draw_type_announced(db, data.w1, data.w2, data.w3, other_type)

    # Find all active tickets of the chosen type that match the numbers
    q = db.query(LotteryTicket).filter(
        LotteryTicket.ticket_type == data.ticket_type,
        LotteryTicket.status == "active",
    )
    if data.ticket_type == "straight":
        q = q.filter(and_(LotteryTicket.n1 == data.w1, LotteryTicket.n2 == data.w2, LotteryTicket.n3 == data.w3))
        matches = q.all()
    else:
        candidates = q.all()
        wsorted = sorted([data.w1, data.w2, data.w3])
        matches = [t for t in candidates if sorted([t.n1, t.n2, t.n3]) == wsorted]

    created: list[Winner] = []
    match_ids: set[int] = set()
    for t in matches:
        match_ids.add(t.ticket_id)
        t.status = "won"
        if data.prize_amount is not None:
            prize = Decimal(data.prize_amount)
        else:
            prize = prize_for_wager(t.amount_wagered, data.ticket_type)
        winner_user = (
            db.query(User).filter(User.user_id == t.user_id).with_for_update().one()
        )
        # Deduct 10% from prize before adding to wallet
        actual_prize = prize * Decimal("0.90")
        winner_user.account_balance = winner_user.account_balance + actual_prize
        w = Winner(
            user_id=t.user_id,
            ticket_id=t.ticket_id,
            w1=data.w1,
            w2=data.w2,
            w3=data.w3,
            ticket_type=data.ticket_type,
            prize_amount=prize,
        )
        db.add(w)
        created.append(w)

    # Non-winners of this type lose their wager once this draw type is announced.
    loser_q = db.query(LotteryTicket).filter(
        LotteryTicket.ticket_type == data.ticket_type,
        LotteryTicket.status == "active",
    )
    if match_ids:
        loser_q = loser_q.filter(~LotteryTicket.ticket_id.in_(match_ids))
    losers_marked = loser_q.update({LotteryTicket.status: "lost"}, synchronize_session=False)

    round_closed = round_will_close

    db.commit()
    for w in created:
        db.refresh(w)

    user_ids = list({w.user_id for w in created})
    users = db.query(User).filter(User.user_id.in_(user_ids)).all() if user_ids else []
    name_map = {u.user_id: u.username for u in users}
    id_map = {u.user_id: u.public_id for u in users}
    winner_out = [
        WinnerOut(
            winner_id=w.winner_id,
            user_id=w.user_id,
            public_id=id_map.get(w.user_id),
            username=name_map.get(w.user_id),
            w1=w.w1,
            w2=w.w2,
            w3=w.w3,
            ticket_type=w.ticket_type,
            prize_amount=w.prize_amount,
            announced_date=w.announced_date,
        )
        for w in created
    ]
    return AnnounceWinnersOut(
        winners=winner_out,
        losers_marked=losers_marked,
        round_closed=round_will_close,
    )

@router.get("/winners/search", response_model=dict)
def search_winners(
    number: str = Query(..., min_length=1, max_length=3),
    date_from: Optional[date] = Query(None, description="Filter from this date (inclusive)"),
    date_to: Optional[date] = Query(None, description="Filter through this date (inclusive)"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Search winners by a 1–3 digit number, optionally within a date range.
    - If 3 digits: returns straight matches (exact order) and rumble matches (any permutation).
    - If 1–2 digits: returns winners whose winning numbers contain those digits.
    """
    if not number.isdigit():
        raise HTTPException(400, "Number must contain digits only")
    if date_from and date_to and date_from > date_to:
        raise HTTPException(400, "date_from must be on or before date_to")

    base = db.query(Winner, User.username, User.public_id, User.phone).join(
        User, User.user_id == Winner.user_id
    )
    if date_from:
        start = datetime.combine(date_from, datetime.min.time(), tzinfo=timezone.utc)
        base = base.filter(Winner.announced_date >= start)
    if date_to:
        end = datetime.combine(date_to + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
        base = base.filter(Winner.announced_date < end)

    straight, rumble = [], []

    if len(number) == 3:
        a, b, c = int(number[0]), int(number[1]), int(number[2])
        s_rows = base.filter(
            Winner.ticket_type == "straight",
            Winner.w1 == a,
            Winner.w2 == b,
            Winner.w3 == c,
        ).all()
        r_rows = base.filter(Winner.ticket_type == "rumble").all()
        target = sorted([a, b, c])
        r_rows = [
            (w, u, pid, ph) for (w, u, pid, ph) in r_rows
            if sorted([w.w1, w.w2, w.w3]) == target
        ]
        straight, rumble = s_rows, r_rows
    else:
        digits = [int(d) for d in number]
        rows = base.all()

        def contains_all(w):
            nums = [w.w1, w.w2, w.w3]
            tmp = nums.copy()
            for d in digits:
                if d in tmp:
                    tmp.remove(d)
                else:
                    return False
            return True

        for w, u, pid, ph in rows:
            if contains_all(w):
                (straight if w.ticket_type == "straight" else rumble).append((w, u, pid, ph))

    def to_out(pairs):
        return [
            WinnerOut(
                winner_id=w.winner_id,
                user_id=w.user_id,
                public_id=pid,
                username=u,
                phone=ph,
                w1=w.w1,
                w2=w.w2,
                w3=w.w3,
                ticket_type=w.ticket_type,
                prize_amount=w.prize_amount,
                announced_date=w.announced_date,
            ).model_dump()
            for w, u, pid, ph in pairs
        ]

    return {"straight": to_out(straight), "rumble": to_out(rumble)}


# ---------- Wallet adjustments ----------
def _resolve_user(db: Session, user_ref: str) -> User:
    ref = user_ref.strip()
    if not ref:
        raise HTTPException(400, "User ID is required")
    q = db.query(User)
    if ref.isdigit():
        user = q.filter(User.user_id == int(ref)).first()
        if user:
            return user
    user = q.filter(func.upper(User.public_id) == ref.upper()).first()
    if user:
        return user
    user = q.filter(User.username.ilike(ref)).first()
    if user:
        return user
    raise HTTPException(404, f"User not found: {ref}")


@router.get("/balance/lookup", response_model=AdminBalanceLookupOut)
def lookup_user_balance(
    user_id: str = Query(..., min_length=1, description="Member ID, numeric id, or username"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = _resolve_user(db, user_id)
    return AdminBalanceLookupOut(
        user_id=user.user_id,
        public_id=user.public_id,
        username=user.username,
        phone=user.phone,
        account_balance=user.account_balance,
    )


@router.post("/balance/add", response_model=AdminBalanceAdjustOut)
def add_user_balance(
    data: AdminBalanceAdjustIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = _resolve_user(db, data.user_id)
    user = db.query(User).filter(User.user_id == user.user_id).with_for_update().one()
    amount = Decimal(data.amount)
    previous = user.account_balance
    user.account_balance = previous + amount
    db.commit()
    db.refresh(user)
    return AdminBalanceAdjustOut(
        action="credit",
        user_id=user.user_id,
        public_id=user.public_id,
        username=user.username,
        amount=amount,
        previous_balance=previous,
        new_balance=user.account_balance,
    )


@router.post("/balance/deduct", response_model=AdminBalanceAdjustOut)
def deduct_user_balance(
    data: AdminBalanceAdjustIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = _resolve_user(db, data.user_id)
    user = db.query(User).filter(User.user_id == user.user_id).with_for_update().one()
    amount = Decimal(data.amount)
    previous = user.account_balance
    if previous < amount:
        raise HTTPException(400, f"Insufficient balance ({float(previous)} SAR available)")
    user.account_balance = previous - amount
    db.commit()
    db.refresh(user)
    return AdminBalanceAdjustOut(
        action="deduct",
        user_id=user.user_id,
        public_id=user.public_id,
        username=user.username,
        amount=amount,
        previous_balance=previous,
        new_balance=user.account_balance,
    )


# ---------- Users ----------
def _user_summary(db: Session, user: User) -> AdminUserSummary:
    ticket_count = (
        db.query(func.count(LotteryTicket.ticket_id))
        .filter(LotteryTicket.user_id == user.user_id)
        .scalar()
        or 0
    )
    deposit_count = (
        db.query(func.count(Deposit.deposit_id))
        .filter(Deposit.user_id == user.user_id)
        .scalar()
        or 0
    )
    win_count = (
        db.query(func.count(Winner.winner_id))
        .filter(Winner.user_id == user.user_id)
        .scalar()
        or 0
    )
    return AdminUserSummary(
        user_id=user.user_id,
        public_id=user.public_id,
        username=user.username,
        phone=user.phone,
        account_balance=user.account_balance,
        is_admin=user.is_admin,
        created_at=user.created_at,
        ticket_count=ticket_count,
        deposit_count=deposit_count,
        win_count=win_count,
    )


@router.get("/users", response_model=list[AdminUserSummary])
def list_users(
    q: Optional[str] = Query(None, description="Search by username, member ID, or phone"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User).order_by(User.created_at.desc())
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(term),
                User.public_id.ilike(term),
                User.phone.ilike(term),
            )
        )
    return [_user_summary(db, u) for u in query.all()]


@router.get("/users/{user_id}", response_model=AdminUserDetail)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    deposits = (
        db.query(Deposit)
        .filter(Deposit.user_id == user_id)
        .order_by(Deposit.created_at.desc())
        .limit(20)
        .all()
    )
    tickets = (
        db.query(LotteryTicket)
        .filter(LotteryTicket.user_id == user_id)
        .order_by(LotteryTicket.created_at.desc())
        .limit(20)
        .all()
    )
    wins = (
        db.query(Winner)
        .filter(Winner.user_id == user_id)
        .order_by(Winner.announced_date.desc())
        .limit(20)
        .all()
    )

    summary = _user_summary(db, user)
    return AdminUserDetail(
        **summary.model_dump(),
        deposits=[
            AdminUserDepositOut(
                deposit_id=d.deposit_id,
                amount_pkr=d.amount,
                amount_riyal=pkr_to_riyal(d.amount),
                status=d.status,
                created_at=d.created_at,
            )
            for d in deposits
        ],
        tickets=[
            AdminUserTicketOut(
                ticket_id=t.ticket_id,
                n1=t.n1,
                n2=t.n2,
                n3=t.n3,
                ticket_type=t.ticket_type,
                amount_wagered=t.amount_wagered,
                status=t.status,
                created_at=t.created_at,
            )
            for t in tickets
        ],
        wins=[
            AdminUserWinOut(
                winner_id=w.winner_id,
                w1=w.w1,
                w2=w.w2,
                w3=w.w3,
                ticket_type=w.ticket_type,
                prize_amount=w.prize_amount,
                announced_date=w.announced_date,
            )
            for w in wins
        ],
    )


# ---------- Reporting ----------
@router.get("/reports", response_model=AdminReportOut)
def get_reports(
    date_from: Optional[date] = Query(None, description="Filter from this date (inclusive)"),
    date_to: Optional[date] = Query(None, description="Filter through this date (inclusive)"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Get lottery play statistics based on actual deducted amounts (57% of wager)."""
    if date_from and date_to and date_from > date_to:
        raise HTTPException(400, "date_from must be on or before date_to")

    base = db.query(LotteryTicket)
    # Adjust for UTC+05:00 timezone (Pakistan time)
    if date_from:
        start = datetime.combine(date_from, datetime.min.time()) - timedelta(hours=5)
        base = base.filter(LotteryTicket.created_at >= start)
    if date_to:
        end = datetime.combine(date_to + timedelta(days=1), datetime.min.time()) - timedelta(hours=5)
        base = base.filter(LotteryTicket.created_at < end)

    # Calculate totals based on actual deducted amount (57% of wager)
    straight_tickets = base.filter(LotteryTicket.ticket_type == "straight").all()
    rumble_tickets = base.filter(LotteryTicket.ticket_type == "rumble").all()

    straight_total = sum(t.amount_wagered * Decimal("0.57") for t in straight_tickets)
    rumble_total = sum(t.amount_wagered * Decimal("0.57") for t in rumble_tickets)
    overall_total = straight_total + rumble_total

    straight_count = len(straight_tickets)
    rumble_count = len(rumble_tickets)
    total_count = straight_count + rumble_count

    return AdminReportOut(
        straight_total=straight_total,
        rumble_total=rumble_total,
        overall_total=overall_total,
        straight_count=straight_count,
        rumble_count=rumble_count,
        total_count=total_count,
        date_from=date_from,
        date_to=date_to,
    )
