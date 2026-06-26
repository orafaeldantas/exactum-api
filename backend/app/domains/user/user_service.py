from collections.abc import Sequence
from uuid import UUID

from app.database.session import DatabaseSession
from app.domains.rbac.container import rbac_service
from app.domains.rbac.rbac_repository import RBACRepository
from app.domains.user.user_exceptions import (
    InvalidPasswordException,
    PasswordMismatchException,
    UserNotFound,
)
from app.domains.user.user_repository import UserRepository
from app.models.user import User


class UserService:
    @staticmethod
    def list_users(tenant_id: int) -> Sequence[User]:

        return UserRepository.get_all(tenant_id)

    @staticmethod
    def create_user(data: dict, tenant_id: int) -> User:

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

        rbac_service.assign_role_to_user(user.id, role.id)

        DatabaseSession.commit()

        return user

    @staticmethod
    def get_user(tenant_id: int, user_uuid: UUID) -> User:

        user = UserRepository.get_user(tenant_id, user_uuid)

        if not user:
            raise UserNotFound()

        return user

    @staticmethod
    def update_user(data: dict, tenant_id: int, user_uuid: UUID) -> User:

        user = UserRepository.get_user(tenant_id, user_uuid)

        if not user:
            raise UserNotFound()

        if data.get("confirme_password"):
            if (data.get("password")) != data.get("confirme_password"):
                raise PasswordMismatchException()

        if data.get("password"):
            user.set_password(data["password"])

        update_fields = ["username", "email", "is_active", "password_reset"]

        for field in update_fields:
            if field in data:
                setattr(user, field, data[field])

        if data.get("role_uuid"):
            new_role = data.get("role_uuid")
            current_role = RBACRepository().get_user_roles(user.id)

            if str(new_role) != str(current_role[0]):
                role = RBACRepository().get_role_by_uuid(data.get("role_uuid"))

                if not role:
                    raise KeyError("Not found role")

                rbac_service.assign_role_to_user(user.id, role.id)

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user

    @staticmethod
    def update_profile(data: dict, tenant_id: int, user_uuid: UUID) -> User:

        user = UserRepository.get_user(tenant_id, user_uuid)

        if not user:
            raise UserNotFound()

        if data.get("current_password"):
            if not user.check_password(data["current_password"]):
                raise InvalidPasswordException()

            if data.get("password") != data.get("confirm_password"):
                raise PasswordMismatchException()

            user.set_password(data["password"])

        update_fields = [
            "username",
            "email",
        ]

        for field in update_fields:
            if field in data:
                setattr(user, field, data[field])

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user
