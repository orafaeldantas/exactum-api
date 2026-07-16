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
    UserNotFound,
)
from app.domains.auth.token_service import TokenService
from app.domains.goal.goal_repository import GoalRepository
from app.domains.observability.observability_constants import PlatformEvents
from app.domains.observability.observability_containers import platform_service
from app.domains.observability.observability_dto import PlatformEventDTO
from app.domains.platform.platform_repository import PlatformRepository
from app.domains.rbac.container import get_rbac_service
from app.domains.rbac.rbac_repository import RBACRepository
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
    def login(
        data: dict, ip_address: str, user_agent: str, request_id: str
    ) -> SessionTokens:

        if not data.get("email"):
            raise InvalidInputEmail()

        email = str(data.get("email"))
        user = UserRepository.get_user_by_email(email)

        if not user:
            raise InvalidCredentials()

        if not user.check_password(str(data.get("password"))):
            raise InvalidCredentials()

        platform_service.create_log(
            PlatformEventDTO(
                event=PlatformEvents.USER_LOGIN,
                tenant_id=user.tenant_id,
                user_id=user.id,
                user_uuid=user.uuid,
                tenant_uuid=user.tenant.uuid,
                payload={
                    "email": user.email,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "request_id": request_id,
                    "account_type": (
                        "super_admin"
                        if user.is_super_admin
                        else f"usuário em {user.tenant.name}"
                    ),
                },
            )
        )

        return AuthService._create_session(user)

    @staticmethod
    def bootstrap_super_admin(user_id: int) -> dict:

        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise BootstrapNotFound()

        permission = ["super-admin"]

        auth = {
            "user_uuid": user.uuid,
            "role": {"name": "super_admin"},
            "permissions": permission,
        }

        bootstrap_data = {
            "auth": auth,
            "user": user,
            "is_super_admin": user.is_super_admin,
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
        roles = get_rbac_service().get_roles(tenant_id)

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
            "roles": list(roles),
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

        user = UserRepository.get_user_by_id(user_id)

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
        user_uuid: UUID,
        jti: str,
        tenant_id: int,
        tenant_uuid: UUID,
        ip_address: str,
        user_agent: str,
        request_id: str,
    ) -> None:

        AuthService.revoke_refresh_token(jti, user_id)

        user = UserRepository.get_user_by_id(user_id)

        if not user:
            raise UserNotFound()

        platform_service.create_log(
            PlatformEventDTO(
                event=PlatformEvents.USER_LOGOUT,
                tenant_id=tenant_id,
                tenant_uuid=tenant_uuid,
                user_id=user_id,
                user_uuid=user_uuid,
                payload={
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "request_id": request_id,
                    "email": user.email,
                    "account_type": (
                        "super_admin"
                        if user.is_super_admin
                        else f"usuário em {user.tenant.name}"
                    ),
                },
            )
        )

    @staticmethod
    def run_impersonate(
        tenant_uuid: UUID,
        original_user_id: int,
        jti: str,
        ip_address: str,
        user_agent: str,
        request_id: str,
    ) -> SessionTokens:

        AuthService.revoke_refresh_token(jti, original_user_id)

        target_admin = PlatformRepository.impersonate(tenant_uuid)

        if not target_admin:
            raise AdminNotFound()

        create_session = AuthService._create_session(
            user=target_admin,
            impersonator_id=original_user_id,
            impersonate=True,
        )

        platform_service.create_log(
            PlatformEventDTO(
                event=PlatformEvents.IMPERSONATION_STARTED,
                tenant_id=target_admin.tenant_id,
                tenant_uuid=target_admin.tenant.uuid,
                user_id=original_user_id,
                user_uuid=target_admin.uuid,
                payload={
                    "request_id": request_id,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "target_user_uuid": str(target_admin.uuid),
                    "target_user_email": target_admin.email,
                    "target_tenant_uuid": str(target_admin.tenant.uuid),
                    "target_tenant_name": target_admin.tenant.name,
                },
            )
        )

        return create_session

    @staticmethod
    def stop_impersonate(
        user_id: int,
        user_uuid: UUID,
        tenant_uuid: UUID,
        jti: str,
        ip_address: str,
        user_agent: str,
        request_id: str,
    ) -> SessionTokens:

        cache_key = CacheKeys.refresh_token(jti, user_id)

        session_data = CacheService.get(cache_key)

        session = RefreshSession(**session_data)

        user = UserRepository.get_user_by_id(user_id)

        if not user:
            raise UserNotFound()

        original_user_id = session.impersonator_id

        AuthService.revoke_refresh_token(jti, user_id)

        if not original_user_id:
            raise AdminNotFound()

        super_admin_user = PlatformRepository.get_super_admin_user(original_user_id)

        if not super_admin_user:
            raise AdminNotFound()

        create_session = AuthService._create_session(
            user=super_admin_user,
        )

        platform_service.create_log(
            PlatformEventDTO(
                event=PlatformEvents.IMPERSONATION_FINISHED,
                tenant_id=session.tenant_id,  # Tenant ID of the impersonated user
                tenant_uuid=tenant_uuid,  # Tenant UUID of the impersonated user
                user_id=super_admin_user.id,
                user_uuid=super_admin_user.uuid,
                payload={
                    "request_id": request_id,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "target_user_uuid": str(user_uuid),  # Impersonated user ID
                    "target_tenant_uuid": str(
                        tenant_uuid  # Tenant UUID of the impersonated user
                    ),
                    "email": user.email,
                    "tenant_name": user.tenant.name,
                },
            )
        )

        return create_session
