import logging
import time

from flask import g
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.core.identifiers.uuid_generator import UUIDGenerator

logger = logging.getLogger(__name__)


def init_request_context(app):
    @app.before_request
    def load_request_context():
        g.request_id = str(UUIDGenerator.generate())
        g.request_started_at = time.perf_counter()
        try:
            verify_jwt_in_request(optional=True)
            claims = get_jwt()
            g.user_id = get_jwt_identity()
            g.user_uuid = claims.get("user_uuid")
            g.tenant_uuid = claims.get("tenant_uuid")
            g.tenant_id = claims.get("tenant_id")
            g.password_reset = claims.get("password_reset")
            g.impersonate_mode = claims.get("impersonate_mode", False)
            g.is_super_admin = claims.get("is_super_admin", False)

        except Exception:
            g.user_id = None
            g.tenant_id = None
            g.user_uuid = None
            g.tenant_uuid = None
            g.password_reset = None
            g.impersonate_mode = False
            g.is_super_admin = False
