from decimal import Decimal, ROUND_HALF_UP
from .config import settings

MONEY_QUANT = Decimal("0.01")


def pkr_to_riyal(pkr: Decimal) -> Decimal:
    return (pkr / Decimal(settings.PKR_PER_RIYAL)).quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)


def riyal_to_pkr(riyal: Decimal) -> Decimal:
    return (riyal * Decimal(settings.PKR_PER_RIYAL)).quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)


def prize_for_wager(wager_riyal: Decimal, ticket_type: str) -> Decimal:
    mult = (
        settings.STRAIGHT_PRIZE_MULTIPLIER
        if ticket_type == "straight"
        else settings.RUMBLE_PRIZE_MULTIPLIER
    )
    return (wager_riyal * Decimal(mult)).quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)
