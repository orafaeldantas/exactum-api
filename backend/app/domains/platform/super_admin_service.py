from collections.abc import Sequence
from typing import TYPE_CHECKING

from app.domains.platform.super_admin_repository import SuperAdminRepository

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class SuperAdminService:
    @staticmethod
    def list_all_tenants() -> Sequence["Tenant"]:

        return SuperAdminRepository.list_all_tenants()
