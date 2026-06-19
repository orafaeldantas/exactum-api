from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask import g

from app.domains.user.user_service import UserService

if TYPE_CHECKING:
    from app.models.user import User


class UserController:
    @staticmethod
    def get_users() -> Sequence["User"]:

        return UserService.list_users(g.tenant_id)

    @staticmethod
    def create_user(data: dict) -> "User":

        return UserService.create_user(data, g.tenant_id)

    @staticmethod
    def get_user(user_uuid: UUID) -> "User":

        return UserService.get_user(user_uuid)

    @staticmethod
    def update_user(data: dict, user_uuid: UUID) -> "User":

        return UserService.update_user(data, user_uuid)

    @staticmethod
    def update_profile(data: dict, user_uuid: UUID) -> "User":

        return UserService.update_profile(data, user_uuid)
