from collections.abc import Sequence
from typing import TYPE_CHECKING

from app.domains.platform.super_admin_service import SuperAdminService

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class SuperAdminController:
    @staticmethod
    def list_all_tenants() -> Sequence["Tenant"]:

        return SuperAdminService.list_all_tenants()
