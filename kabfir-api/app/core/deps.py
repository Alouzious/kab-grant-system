from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import User, UserRole

bearer_scheme = HTTPBearer()

# Roles that have admin-level access across the system
ADMIN_ROLES = {UserRole.admin, UserRole.sgo_admin}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = verify_token(credentials.credentials, token_type="access")
    user_id = int(payload.get("sub"))

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated. Contact the administrator.")

    return user


async def get_current_active_staff(
    current_user: User = Depends(get_current_user),
) -> User:
    """Staff and admin roles can access staff routes (admin may submit on behalf)."""
    if current_user.role not in (UserRole.staff, UserRole.admin, UserRole.sgo_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required.",
        )
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Both admin and sgo_admin have full admin access."""
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


async def get_current_reviewer(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.reviewer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reviewer access required.",
        )
    return current_user
