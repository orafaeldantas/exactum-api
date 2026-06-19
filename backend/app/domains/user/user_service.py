from collections.abc import Sequence
from uuid import UUID

from app.database.session import DatabaseSession
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
            is_active=data.get("is_active"),
            role=data.get("role", "user"),
            email=data.get("email"),
            password_reset=True,
        )

        user.set_password(str(data.get("password")))

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user

    @staticmethod
    def get_user(user_uuid: UUID) -> User:

        user = UserRepository.get_user(user_uuid)

        if not user:
            raise UserNotFound()

        return user

    @staticmethod
    def update_user(data: dict, user_uuid: UUID) -> User:

        user = UserRepository.get_user(user_uuid)

        if not user:
            raise UserNotFound()

        if data.get("confirme_password"):
            if (data.get("password")) != data.get("confirme_password"):
                raise PasswordMismatchException()

        if data.get("password"):
            user.set_password(data["password"])

        update_fields = ["username", "email", "role", "is_active", "password_reset"]

        for field in update_fields:
            if field in data:
                setattr(user, field, data[field])

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user

    @staticmethod
    def update_profile(data: dict, user_uuid: UUID) -> User:

        user = UserRepository.get_user(user_uuid)

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
