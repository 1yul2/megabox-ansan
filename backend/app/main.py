from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import configure_mappers

from app.core.config import KST, now_kst, settings
from app.core.database import Base, SessionLocal, engine
from app.core.redis import get_redis
from app.core.routers import api_router
from app.modules.auth.models import (
    AuditLog,          # noqa: F401 — create_all 이 인식하도록 임포트
    GenderEnum,
    PositionEnum,
    RefreshToken,      # noqa: F401
    StatusEnum,
    User,
)
from app.modules.auth.services import hash_password

configure_mappers()

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if not settings.IS_PRODUCTION else None,
    redoc_url="/redoc" if not settings.IS_PRODUCTION else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    # ✅ 새 테이블만 생성 (기존 테이블/데이터 보존)
    # ❌ drop_all 절대 금지
    Base.metadata.create_all(bind=engine)

    # Redis 연결 검증
    redis = get_redis()
    await redis.ping()

    # 관리자 계정 초기화 (없는 경우에만)
    db = SessionLocal()
    try:
        admin = db.query(User).filter_by(username=settings.ADMIN_USERNAME).first()
        if not admin:
            db.add(User(
                username=settings.ADMIN_USERNAME,
                password=hash_password(settings.ADMIN_PASSWORD),
                birth_date=date(1998, 2, 4),
                name=settings.ADMIN_NAME,
                position=PositionEnum.manager,
                gender=GenderEnum.male,
                email=settings.ADMIN_EMAIL,
                phone="010-0000-0000",
                is_active=True,
                status=StatusEnum.approved,
            ))

        # 개발 환경 테스트 계정
        if settings.MODE == "dev":
            test_users = [
                {
                    "username": "system",
                    "password": "System1!",
                    "name": "시스템",
                    "position": PositionEnum.system,
                    "gender": GenderEnum.male,
                    "email": "system@test.com",
                    "phone": "010-0000-0001",
                },
                {
                    "username": "user1",
                    "password": "User1111!",
                    "name": "일반유저",
                    "position": PositionEnum.crew,
                    "gender": GenderEnum.male,
                    "email": "user@test.com",
                    "phone": "010-0000-0002",
                },
                {
                    "username": "crew1",
                    "password": "Crew1111!",
                    "name": "크루",
                    "position": PositionEnum.crew,
                    "gender": GenderEnum.female,
                    "email": "crew@test.com",
                    "phone": "010-0000-0003",
                },
            ]
            for u in test_users:
                if not db.query(User).filter_by(username=u["username"]).first():
                    db.add(User(
                        username=u["username"],
                        password=hash_password(u["password"]),
                        birth_date=date(1998, 2, 4),
                        name=u["name"],
                        position=u["position"],
                        gender=u["gender"],
                        email=u["email"],
                        phone=u["phone"],
                        is_active=True,
                        status=StatusEnum.approved,
                    ))

        db.commit()
    finally:
        db.close()


app.include_router(api_router, prefix="/api")