from typing import TYPE_CHECKING
from uuid import UUID

from app.core.cache.cache_keys import CacheKeys
from app.core.cache.cache_service import CacheService
from app.core.config.settings import Settings
from app.domains.auth.auth_dto import RefreshSession, SessionTokens
from app.domains.auth.auth_exceptions import (
    AdminNotFound,
    BootstrapNotFound,
    InvalidCredentials,
    InvalidInputEmail,
    RefreshTokenRevoked,
    UnauthorizedUser,
)
from app.domains.auth.auth_repository import AuthRepository
from app.domains.auth.token_service import TokenService
from app.domains.goal.goal_repository import GoalRepository
from app.domains.rbac.container import get_rbac_service
from app.domains.rbac.rbac_repository import RBACRepository
from app.domains.super_admin.super_admin_repository import SuperAdminRepository
from app.domains.tenant.tenant_repository import TenantRepository
from app.domains.user.user_repository import UserRepository

if TYPE_CHECKING:
    from app.models.user import User


class AuthService:
    @staticmethod
    def _create_session(
        user: "User",
        impersonator_id: int | None = None,
        impersonate: bool = False,
    ) -> SessionTokens:

        access_token = TokenService.generate_access_token(
            user,
            impersonate=impersonate,
        )

        refresh_token = TokenService.generate_refresh_token(user)

        AuthService.store_refresh_token(
            refresh_token=refresh_token,
            user_id=user.id,
            tenant_id=user.tenant_id,
            impersonator_id=impersonator_id,
        )

        return SessionTokens(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    @staticmethod
    def login(data: dict) -> SessionTokens:

        if not data.get("email"):
            raise InvalidInputEmail()

        email = str(data.get("email"))
        user = UserRepository.get_user_by_email(email)

        if not user:
            raise InvalidCredentials()

        if not user.check_password(str(data.get("password"))):
            raise InvalidCredentials()

        return AuthService._create_session(user)

    @staticmethod
    def bootstrap_super_admin(user_id: int) -> dict:

        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise BootstrapNotFound()

        permission = ["super-admin"]

        auth = {
            "user_uuid": user.uuid,
            "role": {"name": "super-admin"},
            "permissions": permission,
            "is_super_admin": True,
        }

        bootstrap_data = {
            "auth": auth,
            "user": user,
        }

        return bootstrap_data

    @staticmethod
    def bootstrap(user_id: int, tenant_id: int, impersonate_mode: bool) -> dict:

        user = UserRepository.get_user_by_id(user_id)
        tenant = TenantRepository.get_tenant(tenant_id)
        goal = GoalRepository.get_goal(tenant_id)
        user_role = RBACRepository().get_user_roles(user_id)
        role = RBACRepository().get_role_by_id(user_role[0].role_id)

        if not role:
            raise KeyError("Not found role")

        permissions = get_rbac_service().get_effective_permissions(user_id)

        if not (user and tenant):
            raise BootstrapNotFound()

        auth = {
            "user_id": user.uuid,
            "tenant_id": tenant.uuid,
            "password_reset": user.password_reset,
            "role": {
                "uuid": role.uuid,
                "name": role.name,
            },
            "permissions": list(permissions),
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
            "auth": auth,
        }

        if impersonate_mode:
            bootstrap_data = {
                "user": user,
                "tenant": tenant_formated,
                "auth": auth,
                "impersonate_mode": impersonate_mode,
                "is_super_admin": user.is_super_admin,
            }

        return bootstrap_data

    @staticmethod
    def store_refresh_token(
        refresh_token: str,
        user_id: int,
        tenant_id: int,
        impersonator_id: int | None = None,
    ) -> None:

        jti = TokenService.extract_jti(refresh_token)
        cache_key = CacheKeys.refresh_token(jti, user_id)

        ttl = Settings.refresh_token_ttl()

        session = RefreshSession(
            user_id=user_id,
            tenant_id=tenant_id,
            impersonator_id=impersonator_id,
        )

        CacheService.set_cache(
            key=cache_key,
            value=session.__dict__,
            ttl=ttl,
        )

    @staticmethod
    def revoke_refresh_token(jti: str, user_id: int) -> None:

        cache_key = CacheKeys.refresh_token(jti, user_id)

        CacheService.delete(cache_key)

    @staticmethod
    def refresh_access_token(
        user_id: int,
        jti: str,
    ) -> SessionTokens:

        cache_key = CacheKeys.refresh_token(
            jti,
            user_id,
        )

        session_data = CacheService.get(cache_key)

        if not session_data:
            raise RefreshTokenRevoked()

        user = AuthRepository.get_user_by_id(user_id)

        if not user:
            AuthService.revoke_refresh_token(
                jti,
                user_id,
            )
            raise UnauthorizedUser()

        session = RefreshSession(**session_data)

        AuthService.revoke_refresh_token(
            jti,
            user_id,
        )

        return AuthService._create_session(
            user=user,
            impersonator_id=session.impersonator_id,
            impersonate=bool(session.impersonator_id),
        )

    @staticmethod
    def logout(
        user_id: int,
        jti: str,
    ) -> None:

        AuthService.revoke_refresh_token(jti, user_id)

    @staticmethod
    def run_impersonate(
        tenant_uuid: UUID, original_user_id: int, jti: str
    ) -> SessionTokens:

        AuthService.revoke_refresh_token(jti, original_user_id)

        target_admin = SuperAdminRepository.impersonate(tenant_uuid)

        if not target_admin:
            raise AdminNotFound()

        return AuthService._create_session(
            user=target_admin,
            impersonator_id=original_user_id,
            impersonate=True,
        )

    @staticmethod
    def stop_impersonate(user_id: int, jti: str) -> SessionTokens:

        cache_key = CacheKeys.refresh_token(jti, user_id)

        session_data = CacheService.get(cache_key)

        session = RefreshSession(**session_data)
        original_user_id = session.impersonator_id

        AuthService.revoke_refresh_token(jti, user_id)

        if not original_user_id:
            raise AdminNotFound()

        super_admin_user = SuperAdminRepository.get_super_admin_user(original_user_id)

        if not super_admin_user:
            raise AdminNotFound()

        return AuthService._create_session(
            user=super_admin_user,
        )
