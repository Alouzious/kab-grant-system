import random
import string
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING

from app.core.config import settings

if TYPE_CHECKING:
    from app.models.models import GrantCall


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


def generate_protocol_number(year: int, proposal_id: int) -> str:
    """Generate a unique protocol number e.g. PR2026/PROPOSAL/008"""
    return f"PR{year}/PROPOSAL/{str(proposal_id).zfill(3)}"


def is_kab_email(email: str) -> bool:
    """Check that an email is a valid KAB email address."""
    return email.strip().lower().endswith(settings.KAB_EMAIL_DOMAIN.lower())


def is_submission_open() -> tuple[bool, str]:
    """
    Returns (True, "") if submissions are open.
    Returns (False, reason) if closed.
    """
    today = date.today()
    current_year = today.year

    if current_year != settings.ACTIVE_ACADEMIC_YEAR:
        return False, f"Applications for the {settings.ACTIVE_ACADEMIC_YEAR} academic year are closed."

    deadline = date.fromisoformat(settings.SUBMISSION_DEADLINE)
    if today > deadline:
        return False, f"The submission deadline of {deadline.strftime('%B %d, %Y')} has passed."

    return True, ""


def is_grant_call_accepting(call: "GrantCall", today: date | None = None) -> tuple[bool, str]:
    """
    Check whether a grant call is within its application window.
    Requires status Open and today between opening_date and closing_date (inclusive).
    """
    from app.models.models import GrantCallStatus

    today = today or date.today()

    if call.status != GrantCallStatus.open:
        return False, "This grant call is closed."

    if today < call.opening_date:
        return False, f"Applications open on {call.opening_date.strftime('%B %d, %Y')}."

    if today > call.closing_date:
        return False, f"The deadline of {call.closing_date.strftime('%B %d, %Y')} has passed."

    return True, ""


def grant_call_date_filters(today: date | None = None):
    """SQLAlchemy filters for grant calls currently within their date window."""
    from app.models.models import GrantCall

    today = today or date.today()
    return (GrantCall.opening_date <= today, GrantCall.closing_date >= today)
