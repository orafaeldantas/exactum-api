from __future__ import annotations

from typing import TYPE_CHECKING

from .rbac_dto import RoleWithPermissionsDTO

if TYPE_CHECKING:
    from app.models.rbac import Role


class RBACMapper:
    @staticmethod
    def role_with_permissions_to_dto(entity: Role) -> RoleWithPermissionsDTO:
        """Converts a Role entity into a DTO (output)."""
        return RoleWithPermissionsDTO(
            uuid=entity.uuid,
            name=entity.name,
            permissions=entity.permissions,
        )
