from flask import Response, current_app, jsonify
from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from app.core.cache.cache_keys import CacheKeys
from app.core.cache.cache_service import CacheService
from app.domains.super_admin.super_admin_repository import SuperAdminRepository
from app.exceptions.auth_exceptions import (
    BootstrapNotFound,
    InvalidCredentials,
    InvalidInputEmail,
    RefreshTokenRevoked,
    UnauthorizedUser,
)
from app.repositories.auth_repository import AuthRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.user_repository import UserRepository
from app.services.token_service import TokenService


class AuthService:
    @staticmethod
    def login(data: dict) -> Response:

        if not data.get("email"):
            raise InvalidInputEmail()

        email = str(data.get("email"))
        user = UserRepository.get_user_by_email(email)

        if not user:
            raise InvalidCredentials()

        if not user.check_password(str(data.get("password"))):
            raise InvalidCredentials()

        access_token = TokenService.generate_access_token(user)
        refresh_token = TokenService.generate_refresh_token(user)

        AuthService.store_refresh_token(
            refresh_token=refresh_token,
            user_id=user.id,
            tenant_id=user.tenant_id,
        )

        response = jsonify({"message": "Login successful"})

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response

    @staticmethod
    def bootstrap(user_id: int, tenant_id: int, impersonate_mode: bool) -> dict:

        user = UserRepository.get_user(user_id)
        tenant = TenantRepository.get_tenant(tenant_id)
        goal = GoalRepository.get_goal(tenant_id)

        if not (user and tenant):
            raise BootstrapNotFound()

        auth = {
            "user_id": user.id,
            "tenant_id": tenant.id,
            "role": user.role,
            "password_reset": user.password_reset,
        }

        tenant_formated = {
            "name": tenant.name,
            "corporate_email": tenant.corporate_email,
            "global_min_stock": tenant.global_min_stock,
            "goal": goal.value if goal else 0,
        }

        bootstrap_data = {
            "user": user,
            "tenant": tenant_formated,
            "goal": goal,
            "auth": auth,
        }

        if impersonate_mode:
            bootstrap_data = {
                "user": user,
                "tenant": tenant_formated,
                "goal": goal,
                "auth": auth,
                "impersonate_mode": impersonate_mode,
            }

        return bootstrap_data

    @staticmethod
    def store_refresh_token(
        refresh_token: str, user_id: int, tenant_id: int, impersonator_id: int = None
    ) -> None:

        jti = TokenService.extract_jti(refresh_token)
        cache_key = CacheKeys.refresh_token(jti, user_id)

        ttl = int(current_app.config["JWT_REFRESH_TOKEN_EXPIRES"].total_seconds())

        CacheService.set_cache(
            key=cache_key,
            value={
                "user_id": user_id,
                "tenant_id": tenant_id,
                "impersonator_id": impersonator_id,
            },
            ttl=ttl,
        )

    @staticmethod
    def revoke_refresh_token(jti: str, user_id: int) -> None:

        cache_key = CacheKeys.refresh_token(jti, user_id)

        CacheService.delete(cache_key)

    @staticmethod
    def refresh_access_token() -> Response:

        claims = get_jwt()

        jti = claims["jti"]

        user_id = int(get_jwt_identity())

        cache_key = CacheKeys.refresh_token(jti, user_id)

        session = CacheService.get(cache_key)

        if not session:
            raise RefreshTokenRevoked()

        user = AuthRepository.get_user_by_id(user_id)

        impersonator_id = session["impersonator_id"]

        if not user:
            AuthService.revoke_refresh_token(jti, user_id)
            raise UnauthorizedUser()

        AuthService.revoke_refresh_token(jti, user_id)

        if impersonator_id:
            new_access_token = TokenService.generate_access_token(
                user, impersonate=True
            )
            new_refresh_token = TokenService.generate_refresh_token(user)
            AuthService.store_refresh_token(
                refresh_token=new_refresh_token,
                user_id=user.id,
                tenant_id=user.tenant_id,
                impersonator_id=int(impersonator_id),
            )
        else:
            new_access_token = TokenService.generate_access_token(user)
            new_refresh_token = TokenService.generate_refresh_token(user)
            AuthService.store_refresh_token(
                refresh_token=new_refresh_token,
                user_id=user.id,
                tenant_id=user.tenant_id,
            )

        response = jsonify({"message": "Token refreshed"})

        set_access_cookies(response, new_access_token)

        set_refresh_cookies(response, new_refresh_token)

        return response

    @staticmethod
    def logout() -> Response:
        claims = get_jwt()

        user_id = int(get_jwt_identity())

        AuthService.revoke_refresh_token(claims["jti"], user_id)

        response = jsonify({"message": "Logout successful"})

        unset_jwt_cookies(response)

        return response

    @staticmethod
    def run_impersonate(tenant_id) -> Response:
        claims = get_jwt()

        jti = claims["jti"]

        original_user_id = int(get_jwt_identity())

        AuthService.revoke_refresh_token(jti, original_user_id)

        target_admin = SuperAdminRepository.impersonate(tenant_id)

        access_token = TokenService.generate_access_token(
            target_admin, impersonate=True
        )
        refresh_token = TokenService.generate_refresh_token(target_admin)

        AuthService.store_refresh_token(
            refresh_token=refresh_token,
            user_id=target_admin.id,
            tenant_id=target_admin.tenant_id,
            impersonator_id=original_user_id,
        )

        response = jsonify({"message": "Impersonate successful"})

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response

    @staticmethod
    def stop_impersonate() -> Response:

        claims = get_jwt()

        jti = claims["jti"]

        user_id = int(get_jwt_identity())

        cache_key = CacheKeys.refresh_token(jti, user_id)

        original_user_data = CacheService.get(cache_key)

        original_user_id = int(original_user_data["impersonator_id"])

        AuthService.revoke_refresh_token(jti, user_id)

        super_admin_user = SuperAdminRepository.get_super_admin_user(original_user_id)

        access_token = TokenService.generate_access_token(super_admin_user)
        refresh_token = TokenService.generate_refresh_token(super_admin_user)

        AuthService.store_refresh_token(
            refresh_token=refresh_token,
            user_id=super_admin_user.id,
            tenant_id=super_admin_user.tenant_id,
        )

        response = jsonify({"message": "Impersonate stop"})

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response
