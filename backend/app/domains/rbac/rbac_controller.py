from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask import g

from app.domains.rbac.container import get_rbac_service

if TYPE_CHECKING:
    from app.domains.rbac.rbac_dto import RoleWithPermissionsDTO
    from app.models.rbac import Role


class RBACController:
    @staticmethod
    def get_roles() -> Sequence[Role]:

        return get_rbac_service().get_roles(tenant_id=g.tenant_id)

    @staticmethod
    def get_roles_with_permissions() -> Sequence[RoleWithPermissionsDTO]:

        return get_rbac_service().get_roles_with_permissions(tenant_id=g.tenant_id)

    @staticmethod
    def update_role(data: dict, role_uuid: UUID) -> None:

        return get_rbac_service().update_role(g.tenant_id, role_uuid, data)

    @staticmethod
    def create_role(data: dict) -> None:

        return get_rbac_service().create_role(g.tenant_id, data)
