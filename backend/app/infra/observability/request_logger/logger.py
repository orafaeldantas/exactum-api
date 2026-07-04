import logging
import time
from datetime import UTC, datetime

from flask import g, request

from .formatters import build_request_log

logger = logging.getLogger("infra")


def init_request_logger(app):

    @app.after_request
    def log_request(response):

        # additional security to hide the server version
        # and remove the list of technologies
        response.headers["Server"] = "API"
        response.headers.pop("X-Powered-By", None)

        try:
            duration_ms = None

            if hasattr(g, "request_started_at"):
                duration_ms = round(
                    (time.perf_counter() - g.request_started_at) * 1000,
                    2,
                )

            logger.info(
                build_request_log(
                    {
                        "event": "request_completed",
                        "timestamp": (
                            datetime.now(UTC).isoformat().replace("+00:00", "Z")
                        ),
                        "request_id": getattr(
                            g,
                            "request_id",
                            None,
                        ),
                        "ip": request.remote_addr,
                        "method": request.method,
                        "path": request.path,
                        "status": response.status_code,
                        "duration_ms": duration_ms,
                        "user_id": getattr(
                            g,
                            "user_id",
                            None,
                        ),
                        "tenant_id": getattr(
                            g,
                            "tenant_id",
                            None,
                        ),
                        "is_super_admin": getattr(
                            g,
                            "is_super_admin",
                            False,
                        ),
                        "user_agent": request.headers.get("User-Agent"),
                    }
                )
            )

        except Exception:
            logger.exception("Failed to write request log")

        return response
