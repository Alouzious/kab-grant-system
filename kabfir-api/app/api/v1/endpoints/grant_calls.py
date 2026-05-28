from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import date

from app.core.database import get_db
from app.core.deps import get_current_admin, get_current_user
from app.models.models import GrantCall, GrantCallStatus, User
from app.schemas.schemas import (
    GrantCallCreateRequest, GrantCallUpdateRequest,
    GrantCallResponse, MessageResponse
)

router = APIRouter(prefix="/admin/grant-calls", tags=["Grant Calls"])


async def _get_grant_call(call_id: int, db: AsyncSession) -> GrantCall:
    result = await db.execute(select(GrantCall).where(GrantCall.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grant call not found.")
    return call


@router.get("", response_model=List[GrantCallResponse])
async def list_grant_calls(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all grant calls.
    - Admin / SGO Admin: sees all (Draft, Open, Closed).
    - Staff / Reviewer: sees only Open calls.
    """
    from app.models.models import UserRole
    query = select(GrantCall).order_by(GrantCall.created_at.desc())

    if current_user.role not in (UserRole.admin, UserRole.sgo_admin):
        query = query.where(GrantCall.status == GrantCallStatus.open)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=GrantCallResponse, status_code=status.HTTP_201_CREATED)
async def create_grant_call(
    payload: GrantCallCreateRequest,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin / SGO Admin: create a new grant call. Starts in Draft status."""
    call = GrantCall(
        title=payload.title,
        description=payload.description,
        grant_type=payload.grant_type,
        academic_year=payload.academic_year,
        opening_date=payload.opening_date,
        closing_date=payload.closing_date,
        max_budget=payload.max_budget,
        status=GrantCallStatus.draft,
        created_by=current_user.id,
    )
    db.add(call)
    await db.commit()
    await db.refresh(call)
    return call


@router.get("/{call_id}", response_model=GrantCallResponse)
async def get_grant_call(
    call_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single grant call by ID."""
    return await _get_grant_call(call_id, db)


@router.put("/{call_id}", response_model=GrantCallResponse)
async def update_grant_call(
    call_id: int,
    payload: GrantCallUpdateRequest,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin / SGO Admin: update a grant call. Cannot update a Closed call."""
    call = await _get_grant_call(call_id, db)

    if call.status == GrantCallStatus.closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a closed grant call.",
        )

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(call, field, value)

    await db.commit()
    await db.refresh(call)
    return call


@router.post("/{call_id}/open-window", response_model=GrantCallResponse)
async def open_application_window(
    call_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Open the application window for a grant call.
    Sets status to Open. Can only be done from Draft status.
    """
    call = await _get_grant_call(call_id, db)

    if call.status == GrantCallStatus.open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application window is already open.",
        )
    if call.status == GrantCallStatus.closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reopen a closed grant call.",
        )

    call.status = GrantCallStatus.open
    await db.commit()
    await db.refresh(call)
    return call


@router.post("/{call_id}/close-window", response_model=GrantCallResponse)
async def close_application_window(
    call_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Close the application window for a grant call.
    Sets status to Closed. Can only be done from Open status.
    """
    call = await _get_grant_call(call_id, db)

    if call.status == GrantCallStatus.closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application window is already closed.",
        )
    if call.status == GrantCallStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot close a grant call that was never opened.",
        )

    call.status = GrantCallStatus.closed
    await db.commit()
    await db.refresh(call)
    return call


@router.delete("/{call_id}", response_model=MessageResponse)
async def delete_grant_call(
    call_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a grant call. Only Draft calls can be deleted —
    Open and Closed calls must be closed first.
    """
    call = await _get_grant_call(call_id, db)

    if call.status != GrantCallStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Draft grant calls can be deleted. Close the call first.",
        )

    await db.delete(call)
    await db.commit()
    return MessageResponse(message="Grant call deleted successfully.")
