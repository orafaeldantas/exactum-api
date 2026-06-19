from typing import TYPE_CHECKING

from flask import g

from app.domains.tenant.tenant_service import TenantService

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class TenantController:
    @staticmethod
    def create_tenant(data: dict) -> "Tenant":

        return TenantService.create_tenant(data)

    @staticmethod
    def get_tenant() -> "Tenant":

        return TenantService.get_tenant(g.tenant_id)

    @staticmethod
    def update_tenant(data: dict) -> "Tenant":

        return TenantService.update_tenant(g.tenant_id, data)
