import os
import time
from datetime import UTC, datetime

from flask import current_app
from sqlalchemy import text

from app.extensions import db


class HealthService:
    start_time = time.time()

    @staticmethod
    def _measure(check_func):
        start = time.perf_counter()

        try:
            check_func()

            latency = round((time.perf_counter() - start) * 1000, 2)

            return {
                "status": "up",
                "latency": f"{latency}ms",
            }

        except Exception as exc:
            return {
                "status": "down",
                "error": str(exc),
            }

    @staticmethod
    def check_postgres():
        db.session.execute(text("SELECT 1"))

    @staticmethod
    def check_redis():
        redis = current_app.extensions["redis"]
        redis.ping()

    @classmethod
    def get_checks(cls) -> dict:
        return {
            "postgres": {
                "required": True,
                "check": cls.check_postgres,
            },
            "redis": {
                "required": True,
                "check": cls.check_redis,
            },
        }

    @classmethod
    def check_services(cls) -> dict:
        checks = cls.get_checks()

        services = {}

        for service_name, config in checks.items():
            services[service_name] = cls._measure(config["check"])

        healthy = all(
            services[service_name]["status"] == "up"
            for service_name, config in checks.items()
            if config["required"]
        )

        return {
            "status": ("healthy" if healthy else "unhealthy"),
            "environment": os.getenv("FLASK_ENV", "production"),
            "version": os.getenv("APP_VERSION", "dev"),
            "timestamp": datetime.now(UTC),
            "uptime_seconds": int(time.time() - cls.start_time),
            "services": services,
            "http_status": (200 if healthy else 503),
        }
