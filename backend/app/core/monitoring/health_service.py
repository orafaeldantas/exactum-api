from flask import current_app
from sqlalchemy import text

from app.extensions import db


class HealthService:
    @staticmethod
    def check_redis() -> bool:
        try:
            redis = current_app.extensions["redis"]
            redis.ping()
            return True
        except Exception:
            return False

    @staticmethod
    def check_postgres() -> bool:
        try:
            db.session.execute(text("SELECT 1"))
            return True
        except Exception:
            return False

    @classmethod
    def check_services(cls) -> dict:

        postgres_ok = cls.check_postgres()
        redis_ok = cls.check_redis()

        healthy = postgres_ok and redis_ok

        return {
            "status": "healthy" if healthy else "unhealthy",
            "services": {
                "postgres": "up" if postgres_ok else "down",
                "redis": "up" if redis_ok else "down",
            },
            "http_status": 200 if healthy else 503,
        }
