from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask import g

from app.domains.user.user_service import UserService

if TYPE_CHECKING:
    from app.models.user import User

    from .user_dto import GetUserDTO


class UserController:
    @staticmethod
    def get_users() -> Sequence["User"]:

        return UserService.list_users(g.tenant_id)

    @staticmethod
    def create_user(data: dict) -> "User":

        return UserService.create_user(
            data,
            user_id=g.user_id,
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
        )

    @staticmethod
    def get_user(user_uuid: UUID) -> "GetUserDTO":

        return UserService.get_user(g.tenant_id, user_uuid)

    @staticmethod
    def update_user(data: dict, target_user_uuid: UUID) -> "User":

        return UserService.update_user(
            data,
            target_user_uuid=target_user_uuid,
            user_id=g.user_id,
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
        )

    @staticmethod
    def update_profile(data: dict, user_uuid: UUID) -> "User":

        return UserService.update_profile(data, g.tenant_id, user_uuid)

    @staticmethod
    def delete_user(target_user_uuid: UUID) -> None:

        return UserService.delete_user(
            user_id=g.user_id,
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
            target_user_uuid=target_user_uuid,
        )
