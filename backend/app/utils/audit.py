"""감사 로그 기록 유틸리티

비즈니스 로직 흐름을 방해하지 않도록 예외를 삼킨다.
commit은 호출자가 담당한다 (트랜잭션 일관성 보장).
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import KST


def write_audit_log(
    db: Session,
    event_type: str,
    *,
    actor_id: int | None = None,
    target_user_id: int | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """audit_logs 테이블에 이벤트를 기록한다.

    - 실패해도 예외를 전파하지 않는다.
    - db.flush() / db.commit()은 호출자가 처리한다.
    """
    try:
        # 순환 임포트 방지를 위해 함수 내부에서 임포트
        from app.modules.auth.models import AuditLog

        log = AuditLog(
            event_type=event_type,
            actor_id=actor_id,
            target_user_id=target_user_id,
            ip_address=ip,
            user_agent=user_agent,
            details=details,
            created_at=datetime.now(KST),
        )
        db.add(log)
    except Exception:
        pass
