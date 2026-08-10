from uuid import UUID

from flask import Response, g, request
from flask_jwt_extended import get_jwt, get_jwt_identity

from app.core.responses.auth_response import AuthResponse
from app.domains.auth.auth_service import AuthService


class AuthController:
    @staticmethod
    def login(data: dict) -> Response:

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        tokens = AuthService.login(data, ip_address, user_agent, g.request_id)

        return AuthResponse.success(
            message="Login successful",
            tokens=tokens,
        )

    @staticmethod
    def bootstrap() -> dict:

        if g.is_super_admin:
            return AuthService.bootstrap_super_admin(g.user_id)

        return AuthService.bootstrap(g.user_id, g.tenant_id, g.impersonate_mode)

    @staticmethod
    def refresh_access_token() -> Response:

        claims = get_jwt()

        tokens = AuthService.refresh_access_token(
            user_id=int(get_jwt_identity()),
            jti=claims["jti"],
            tenant_id=claims["tenant_id"],
        )

        return AuthResponse.success(
            "Token refreshed",
            tokens,
        )

    @staticmethod
    def logout() -> Response:

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        claims = get_jwt()

        AuthService.logout(
            user_id=int(get_jwt_identity()),
            user_uuid=g.user_uuid,
            jti=claims["jti"],
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=g.request_id,
        )

        return AuthResponse.logout("Logout successful")

    @staticmethod
    def run_impersonate(tenant_uuid: UUID) -> Response:

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        claims = get_jwt()

        tokens = AuthService.run_impersonate(
            tenant_uuid=tenant_uuid,
            original_user_id=int(get_jwt_identity()),
            original_user_uuid=g.user_uuid,
            original_tenant_id=g.tenant_id,
            jti=claims["jti"],
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=g.request_id,
        )

        return AuthResponse.success(
            "Impersonate successful",
            tokens,
        )

    @staticmethod
    def stop_impersonate() -> Response:

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        claims = get_jwt()

        tokens = AuthService.stop_impersonate(
            user_id=int(get_jwt_identity()),
            tenant_id=claims["tenant_id"],
            jti=claims["jti"],
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=g.request_id,
        )

        return AuthResponse.success(
            "Impersonate stop",
            tokens,
        )

    @staticmethod
    def remove_user_session() -> None:

        return AuthService.remove_user_session(g.tenant_id, g.user_id)

    @staticmethod
    def remove_tenant_session() -> None:

        return AuthService.remove_tenant_session(g.tenant_id)
