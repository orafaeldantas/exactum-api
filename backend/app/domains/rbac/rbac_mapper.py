from __future__ import annotations

from typing import TYPE_CHECKING, cast

from .rbac_dto import PermissionDict, RoleWithPermissionsDTO

if TYPE_CHECKING:
    from app.models.rbac import Role


class RBACMapper:
    @staticmethod
    def role_with_permissions_to_dto(entity: Role) -> RoleWithPermissionsDTO:
        """Converts a Role entity into a DTO (output)."""
        return RoleWithPermissionsDTO(
            uuid=entity.uuid,
            name=entity.name,
            permissions=cast(list[PermissionDict], entity.permissions),
        )
