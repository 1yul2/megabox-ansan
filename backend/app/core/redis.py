"""Redis 클라이언트 싱글톤 및 키 관리 모듈"""
import redis.asyncio as aioredis

from app.core.config import settings

# 모듈 로드 시 연결 풀 생성 (실제 연결은 첫 명령 시점에 수행)
_redis_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    """FastAPI Depends() 또는 직접 호출로 Redis 클라이언트를 반환한다."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50,
        )
    return _redis_client


class RedisKeys:
    """Redis 키 네임스페이스 관리 — 오타 방지 및 일관성 보장"""

    @staticmethod
    def refresh_token(token_hash: str) -> str:
        """refresh:{hash} → user_id (value)"""
        return f"refresh:{token_hash}"

    @staticmethod
    def session(user_id: int) -> str:
        """session:{user_id} → SET of token_hashes"""
        return f"session:{user_id}"

    @staticmethod
    def blacklist(jti: str) -> str:
        """blacklist:{jti} → '1'  (로그아웃된 Access Token)"""
        return f"blacklist:{jti}"

    @staticmethod
    def login_rate_ip(ip: str) -> str:
        """ratelimit:login:ip:{ip} → 시도 횟수"""
        return f"ratelimit:login:ip:{ip}"

    @staticmethod
    def login_rate_user(username: str) -> str:
        """ratelimit:login:user:{username} → 시도 횟수"""
        return f"ratelimit:login:user:{username}"
