"""JWT 검증 및 인가 Dependency"""
from __future__ import annotations

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.redis import RedisKeys, get_redis
from app.modules.auth.models import PositionEnum, StatusEnum, User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    cred:  HTTPAuthorizationCredentials = Depends(security),
    db:    Session = Depends(get_db),
    redis=Depends(get_redis),
) -> User:
    if cred is None or not cred.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = cred.credentials
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    jti = payload.get("jti")
    sub = payload.get("sub")

    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # 블랙리스트 확인 (로그아웃된 토큰)
    if jti and await redis.exists(RedisKeys.blacklist(jti)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

    user = db.execute(select(User).where(User.id == int(sub))).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive account")
    if user.status == StatusEnum.suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    if user.status not in {StatusEnum.approved}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not approved")

    return user


async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.position not in {PositionEnum.manager, PositionEnum.system}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
