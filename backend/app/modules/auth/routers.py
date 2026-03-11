import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.auth.models import PositionEnum, StatusEnum, User
from app.modules.auth.services import encrypt_ssn
from app.utils.permission_utils import is_system

from . import schemas, services
from .models import RefreshToken

router = APIRouter()


@router.post(
    "/register",
    response_model=schemas.RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="회원가입 신청 (pending 상태)",
)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # 아이디 중복 확인
    if services.get_user_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="이미 사용 중인 아이디입니다.")

    # 이메일 중복 확인
    existing_email = db.query(User).filter(User.email == str(payload.email)).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="이미 사용 중인 이메일입니다.")

    user = User(
        username=payload.username,
        password=services.hash_password(payload.password),
        name=payload.name,
        position=PositionEnum.crew,  # 자가 가입은 항상 크루
        gender=payload.gender,
        birth_date=payload.birth_date,
        ssn=encrypt_ssn(payload.ssn) if payload.ssn else None,
        phone=payload.phone,
        email=str(payload.email),
        hire_date=payload.hire_date,
        health_cert_expire=payload.health_cert_expire,
        unavailable_days=payload.unavailable_days,
        is_active=True,
        status=StatusEnum.pending,  # 가입 신청 → 반드시 pending
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 아이디 또는 이메일입니다.")

    return {"message": "가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다."}


@router.post("/login", response_model=schemas.TokenResponse, summary="로그인 시도")
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = services.get_user_by_username(db, payload.username)

    # 아이디/비밀번호 검증
    if not user or not services.verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    # 가입 상태 검증
    if user.status == StatusEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 승인 대기중입니다.",
        )
    if user.status == StatusEnum.rejected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="가입이 거절되었습니다. 관리자에게 문의하세요.",
        )

    access_token = services.create_access_token(
        sub=str(user.id),
        username=user.username,
        is_admin=services.is_admin_position(user.position),
    )
    refresh_token, expires_at = services.create_refresh_token(sub=str(user.id))
    db.add(
        RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at,
        )
    )
    db.commit()

    return {
        "is_system": is_system(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.UserResponse, summary="유저 조회")
def me(cuurent_user=Depends(get_current_user)):
    return cuurent_user


@router.get(
    "/staff",
    response_model=list[schemas.StaffResponse],
    summary="재직중인 리더/크루 목록 조회",
)
def staff(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if is_system(current_user):
        raise HTTPException(status_code=403, detail="시스템 계정은 조회할 수 없습니다.")
    staff = (
        db.query(User)
        .filter(
            User.is_active.is_(True),
            User.position.in_([PositionEnum.leader, PositionEnum.crew]),
            User.id != current_user.id,
        )
        .all()
    )
    return staff


@router.post(
    "/refresh", response_model=schemas.RefreshRequest, summary="리프레쉬 토큰 재발급"
)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            refresh_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    db_token = db.query(RefreshToken).filter_by(token=refresh_token).first()
    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db_token.user

    new_access_token = services.create_access_token(
        sub=str(user.id),
        username=user.username,
        is_admin=services.is_admin_position(user.position),
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout", summary="로그아웃 시도")
def logout(
    refresh_token: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == refresh_token,
            RefreshToken.user_id == current_user.id,
        )
        .delete()
    )
    db.commit()

    if not deleted:
        raise HTTPException(status_code=400, detail="Already logged out")

    return {"message": "로그아웃 완료"}
