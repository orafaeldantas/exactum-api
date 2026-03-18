from flask import g
from flask_jwt_extended import get_jwt, verify_jwt_in_request, get_jwt_identity

def init_request_context(app):
    @app.before_request
    def load_request_context():
        try:
            verify_jwt_in_request(optional=True)
            claims = get_jwt()

            g.user_id = get_jwt_identity()
            g.tenant_id = claims.get("tenant_id")
            g.role = claims.get("role")
            g.email = claims.get("email")
            g.username = claims.get("username")

        except Exception:
            g.user_id = None
            g.tenant_id = None
            g.role = None
            g.email = None
            g.username = None