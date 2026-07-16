from app.models.rbac import Role
from app.models.user import User

from .user_dto import GetUserDTO


class UserMapper:
    @staticmethod
    def get_user_to_dto(user_entity: User, role_entity: Role) -> GetUserDTO:

        return GetUserDTO(
            uuid=user_entity.uuid,
            username=user_entity.username,
            is_active=user_entity.is_active,
            email=user_entity.email,
            role=role_entity.name,
        )
