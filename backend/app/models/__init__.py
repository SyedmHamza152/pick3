from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    public_id = Column(String(16), unique=True, nullable=False)
    username = Column(String(64), unique=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    security_question = Column(String(255), nullable=False)
    security_answer = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    account_balance = Column(Numeric(12, 2), nullable=False, default=0)
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LotteryTicket(Base):
    __tablename__ = "lottery_tickets"
    ticket_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    n1 = Column(Integer, nullable=False)
    n2 = Column(Integer, nullable=False)
    n3 = Column(Integer, nullable=False)
    ticket_type = Column(String(10), nullable=False)  # straight | rumble
    amount_wagered = Column(Numeric(12, 2), nullable=False)
    status = Column(String(10), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Winner(Base):
    __tablename__ = "winners"
    winner_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    ticket_id = Column(Integer, ForeignKey("lottery_tickets.ticket_id", ondelete="SET NULL"))
    w1 = Column(Integer, nullable=False)
    w2 = Column(Integer, nullable=False)
    w3 = Column(Integer, nullable=False)
    ticket_type = Column(String(10), nullable=False)
    prize_amount = Column(Numeric(12, 2), nullable=False)
    announced_date = Column(DateTime(timezone=True), server_default=func.now())

class Deposit(Base):
    __tablename__ = "deposits"
    deposit_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    screenshot_path = Column(String(512), nullable=False)
    status = Column(String(10), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))
    reviewed_by = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"))
