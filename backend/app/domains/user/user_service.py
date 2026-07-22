from __future__ import annotations

from collections.abc import Sequence
from typing import cast
from uuid import UUID

from sqlalchemy.exc import IntegrityError

from app.core.cache.cache_keys import CacheKeys
from app.core.cache.cache_service import CacheService
from app.core.config.settings import Settings
from app.database.session import DatabaseSession
from app.domains.observability.observability_constants import AuditEvents
from app.domains.observability.observability_containers import audit_service
from app.domains.observability.observability_dto import AuditLogDTO
from app.domains.rbac.container import get_rbac_service
from app.domains.rbac.rbac_repository import RBACRepository
from app.domains.user.user_exceptions import (
    ExistingUserField,
    InvalidPasswordException,
    PasswordMismatchException,
    UserNotFound,
)
from app.domains.user.user_repository import UserRepository
from app.models.user import User

from .user_dto import GetUserDTO
from .user_mapper import UserMapper


class UserService:
    @staticmethod
    def list_users(tenant_id: int) -> Sequence[GetUserDTO]:

        users = UserRepository.get_all(tenant_id)

        users_with_role = []

        for user in users:
            user_role = get_rbac_service().get_user_roles(user.id)
            role = get_rbac_service().get_role_by_id(user_role[0].role_id)
            users_with_role.append(UserMapper.get_user_to_dto(user, role))

        return cast(Sequence[GetUserDTO], users_with_role)

    @staticmethod
    def create_user(
        data: dict, user_id: int, user_uuid: UUID, tenant_id: int, tenant_uuid: UUID
    ) -> User:

        user = User(
            username=data.get("username"),
            tenant_id=tenant_id,
            is_active=data.get("is_active", True),
            email=data.get("email"),
            password_reset=True,
        )

        user.set_password(str(data.get("password")))

        DatabaseSession.add(user)
        DatabaseSession.flush()

        role = RBACRepository().get_role_by_uuid(data.get("role_uuid"))

        if not role:
            raise KeyError("Not found role")

        get_rbac_service().assign_role_to_user(tenant_id, user.id, role.id)

        try:
            DatabaseSession.commit()

            audit_service.create_log(
                AuditLogDTO(
                    event=AuditEvents.USER_CREATED,
                    tenant_id=tenant_id,
                    user_id=user_id,
                    user_uuid=user_uuid,
                    tenant_uuid=tenant_uuid,
                    entity="user",
                    payload={
                        "entity_uuid": str(user.uuid),
                        "data": {
                            "name": user.username,
                            "email": user.email,
                            "role": role.name,
                        },
                    },
                )
            )

            return user

        except IntegrityError:
            DatabaseSession.rollback()
            raise ExistingUserField()

    @staticmethod
    def get_user(tenant_id: int, user_uuid: UUID) -> GetUserDTO:

        user = UserRepository.get_user(tenant_id, user_uuid)

        if not user:
            raise UserNotFound()

        user_role = get_rbac_service().get_user_roles(user.id)
        role = get_rbac_service().get_role_by_id(user_role[0].role_id)

        return UserMapper.get_user_to_dto(user, role)

    @staticmethod
    def update_user(
        data: dict,
        target_user_uuid: UUID,
        user_id: int,
        user_uuid: UUID,
        tenant_id: int,
        tenant_uuid: UUID,
    ) -> User | None:

        user = UserRepository.get_user(tenant_id, target_user_uuid)

        if not user:
            raise UserNotFound()

        changes = {}

        if data.get("confirme_password"):
            if (data.get("password")) != data.get("confirme_password"):
                raise PasswordMismatchException()

        if data.get("password"):
            user.set_password(data["password"])

        if data.get("role_uuid"):
            new_role = data.get("role_uuid")
            user_role = RBACRepository().get_user_roles(user.id)
            current_role = RBACRepository().get_role_by_id(user_role[0].role_id)

            if not current_role:
                raise KeyError("Not found role")

            if str(new_role) != str(current_role.uuid):
                role = RBACRepository().get_role_by_uuid(new_role)

                if not role:
                    raise KeyError("Not found role")

                changes["role"] = {
                    "old": current_role.name,
                    "new": role.name,
                }

                get_rbac_service().assign_role_to_user(tenant_id, user.id, role.id)

        allowed_fields = {
            "username",
            "email",
            "is_active",
            "password_reset",
        }

        for field, new_value in data.items():
            if field not in allowed_fields:
                continue

            old_value = getattr(user, field)

            if old_value != new_value:
                changes[field] = {
                    "old": old_value,
                    "new": new_value,
                }

                setattr(user, field, new_value)

        try:
            if not changes:
                return None

            DatabaseSession.commit()

            audit_service.create_log(
                AuditLogDTO(
                    event=AuditEvents.USER_UPDATED,
                    tenant_id=tenant_id,
                    tenant_uuid=tenant_uuid,
                    user_id=user_id,
                    user_uuid=user_uuid,
                    entity="user",
                    payload={
                        "entity_uuid": str(user.uuid),
                        "name": user.username,
                        "changes": changes,
                    },
                )
            )

            if changes.get("is_active"):
                status_user = changes.get("is_active")
                remove_user_session = status_user.get("old")

            if remove_user_session:
                key_to_remove_user_session = f"tenant:{tenant_id}:user:{user.id}:*"
                CacheService().delete(key_to_remove_user_session)

                key_to_put_user_blocklist = CacheKeys.blocklist_user(tenant_id, user.id)

                value = "User blocked"
                ttl = Settings.blocklist_ttl()
                CacheService().set_cache(key_to_put_user_blocklist, value, ttl)

            return user

        except IntegrityError:
            DatabaseSession.rollback()
            raise ExistingUserField()

    @staticmethod
    def update_profile(data: dict, tenant_id: int, user_uuid: UUID) -> User | None:

        user = UserRepository.get_user(tenant_id, user_uuid)

        if not user:
            raise UserNotFound()

        changes: dict[str, object] = {}

        if data.get("current_password"):
            if not user.check_password(data["current_password"]):
                raise InvalidPasswordException()

            if data.get("password") != data.get("confirm_password"):
                raise PasswordMismatchException()

            user.set_password(data["password"])
            changes["new_password"] = True

        allowed_fields = {
            "username",
            "email",
        }

        for field, new_value in data.items():
            if field not in allowed_fields:
                continue

            old_value = getattr(user, field)

            if old_value != new_value:
                changes[field] = {
                    "old": old_value,
                    "new": new_value,
                }

                setattr(user, field, new_value)

        try:
            if not changes:
                return None

            DatabaseSession.commit()

            audit_service.create_log(
                AuditLogDTO(
                    event=AuditEvents.PROFILE_UPDATED,
                    tenant_id=tenant_id,
                    tenant_uuid=user.tenant.uuid,
                    user_id=user.id,
                    user_uuid=user.uuid,
                    entity="user",
                    payload={
                        "entity_uuid": str(user.uuid),
                        "name": user.username,
                        "changes": changes,
                    },
                )
            )

            return user

        except IntegrityError:
            DatabaseSession.rollback()
            raise ExistingUserField()

    @staticmethod
    def delete_user(
        user_id: int,
        user_uuid: UUID,
        tenant_id: int,
        tenant_uuid: UUID,
        target_user_uuid: UUID,
    ) -> None:

        target_user = UserRepository.get_user(tenant_id, target_user_uuid)

        if not target_user:
            raise UserNotFound()

        UserRepository.delete_user(target_user)

        audit_service.create_log(
            AuditLogDTO(
                event=AuditEvents.USER_DELETED,
                tenant_id=tenant_id,
                tenant_uuid=tenant_uuid,
                user_id=user_id,
                user_uuid=user_uuid,
                entity="user",
                payload={
                    "entity_uuid": str(target_user.uuid),
                    "deleted_data": {
                        "name": target_user.username,
                        "email": target_user.email,
                    },
                },
            )
        )
