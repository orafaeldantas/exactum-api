from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask import g

from app.domains.rbac.container import get_rbac_service

if TYPE_CHECKING:
    from app.models.rbac import Role


class RBACController:
    @staticmethod
    def get_roles() -> Sequence["Role"]:

        return get_rbac_service().get_roles(tenant_id=g.tenant_id)
