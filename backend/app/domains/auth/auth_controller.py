from flask import g
from flask_jwt_extended import get_jwt, get_jwt_identity

from app.core.responses.auth_response import AuthResponse
from app.domains.auth.auth_service import AuthService


class AuthController:
    @staticmethod
    def login(data):

        tokens = AuthService.login(data)

        return AuthResponse.success(
            message="Login successful",
            tokens=tokens,
        )

    @staticmethod
    def bootstrap():

        return AuthService.bootstrap(g.user_id, g.tenant_id, g.impersonate_mode)

    @staticmethod
    def refresh_access_token():

        claims = get_jwt()

        tokens = AuthService.refresh_access_token(
            user_id=int(get_jwt_identity()),
            jti=claims["jti"],
        )

        return AuthResponse.success(
            "Token refreshed",
            tokens,
        )

    @staticmethod
    def logout():

        claims = get_jwt()

        AuthService.logout(
            user_id=int(get_jwt_identity()),
            jti=claims["jti"],
        )

        return AuthResponse.logout("Logout successful")

    @staticmethod
    def run_impersonate(tenant_id):

        claims = get_jwt()

        tokens = AuthService.run_impersonate(
            tenant_id=tenant_id,
            original_user_id=int(get_jwt_identity()),
            jti=claims["jti"],
        )

        return AuthResponse.success(
            "Impersonate successful",
            tokens,
        )

    @staticmethod
    def stop_impersonate():

        claims = get_jwt()

        tokens = AuthService.stop_impersonate(
            user_id=int(get_jwt_identity()),
            jti=claims["jti"],
        )

        return AuthResponse.success(
            "Impersonate stop",
            tokens,
        )
