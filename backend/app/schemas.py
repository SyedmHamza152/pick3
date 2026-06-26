from pydantic import BaseModel, Field, conint, condecimal, field_validator
from typing import Optional, Literal
from datetime import datetime, date
from decimal import Decimal

Digit = conint(ge=0, le=9)

class SignupIn(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=6, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: str = Field(max_length=255)
    security_question: str = Field(min_length=1, max_length=255)
    security_answer: str = Field(min_length=1, max_length=255)

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not str(v).strip():
            return None
        cleaned = "".join(c for c in str(v).strip() if c.isdigit() or c == "+")
        if len(cleaned) < 7 or len(cleaned) > 15:
            raise ValueError("Phone must be 7–15 digits (optional + prefix)")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if not v or not str(v).strip():
            raise ValueError("Email is required")
        return str(v).strip().lower()

class LoginIn(BaseModel):
    username: str
    password: str

class ForgotPasswordValidateIn(BaseModel):
    email: str = Field(max_length=255)
    username: str
    security_answer: Optional[str] = Field(default=None, max_length=255)

class ForgotPasswordResetIn(BaseModel):
    email: str = Field(max_length=255)
    username: str
    security_answer: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=6, max_length=128)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    public_id: str
    username: str
    phone: Optional[str] = None
    is_admin: bool
    account_balance: Decimal

class TicketIn(BaseModel):
    n1: Digit
    n2: Digit
    n3: Digit
    ticket_type: Literal["straight", "rumble"]
    amount_wagered: condecimal(gt=Decimal("0"), max_digits=12, decimal_places=2)

class TicketOut(BaseModel):
    ticket_id: int
    n1: int; n2: int; n3: int
    ticket_type: str
    amount_wagered: Decimal
    status: str
    created_at: datetime
    class Config: from_attributes = True

class DepositRequestOut(BaseModel):
    deposit_id: int
    user_id: int
    public_id: Optional[str] = None
    username: Optional[str] = None
    amount_pkr: Decimal
    amount_riyal: Decimal
    screenshot_path: str
    status: str
    created_at: datetime

class WinnerIn(BaseModel):
    w1: Digit; w2: Digit; w3: Digit
    ticket_type: Literal["straight", "rumble"]
    prize_amount: Optional[condecimal(gt=Decimal("0"), max_digits=12, decimal_places=2)] = None

class CurrencyOut(BaseModel):
    pkr_per_riyal: int
    straight_prize_multiplier: int
    rumble_prize_multiplier: int
    currency_display: str = "SAR"

class WinnerOut(BaseModel):
    winner_id: int
    user_id: int
    public_id: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    w1: int; w2: int; w3: int
    ticket_type: str
    prize_amount: Decimal
    announced_date: datetime


class AnnounceWinnersOut(BaseModel):
    winners: list[WinnerOut]
    losers_marked: int
    round_closed: bool

class BalanceOut(BaseModel):
    account_balance: Decimal


class AdminUserSummary(BaseModel):
    user_id: int
    public_id: str
    username: str
    phone: Optional[str] = None
    account_balance: Decimal
    is_admin: bool
    created_at: datetime
    ticket_count: int = 0
    deposit_count: int = 0
    win_count: int = 0


class AdminUserDepositOut(BaseModel):
    deposit_id: int
    amount_pkr: Decimal
    amount_riyal: Decimal
    status: str
    created_at: datetime


class AdminUserTicketOut(BaseModel):
    ticket_id: int
    n1: int
    n2: int
    n3: int
    ticket_type: str
    amount_wagered: Decimal
    status: str
    created_at: datetime


class AdminUserWinOut(BaseModel):
    winner_id: int
    w1: int
    w2: int
    w3: int
    ticket_type: str
    prize_amount: Decimal
    announced_date: datetime


class AdminUserDetail(AdminUserSummary):
    deposits: list[AdminUserDepositOut]
    tickets: list[AdminUserTicketOut]
    wins: list[AdminUserWinOut]


class AdminBalanceAdjustIn(BaseModel):
    user_id: str = Field(min_length=1, max_length=64, description="Member ID (e.g. LOT000042), numeric user id, or username")
    amount: condecimal(gt=Decimal("0"), max_digits=12, decimal_places=2)


class AdminBalanceLookupOut(BaseModel):
    user_id: int
    public_id: str
    username: str
    phone: Optional[str] = None
    account_balance: Decimal


class AdminBalanceAdjustOut(BaseModel):
    ok: bool = True
    action: Literal["credit", "deduct"]
    user_id: int
    public_id: str
    username: str
    amount: Decimal
    previous_balance: Decimal
    new_balance: Decimal


class AdminUploadsStatsOut(BaseModel):
    count: int
    total_bytes: int


class AdminUploadsClearOut(BaseModel):
    ok: bool = True
    deleted: int


class AdminReportOut(BaseModel):
    straight_total: Decimal
    rumble_total: Decimal
    overall_total: Decimal
    straight_count: int
    rumble_count: int
    total_count: int
    date_from: Optional[date] = None
    date_to: Optional[date] = None
