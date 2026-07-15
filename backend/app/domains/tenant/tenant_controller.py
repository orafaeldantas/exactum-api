from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask import g, request
from flask_jwt_extended import get_jwt_identity

from app.domains.tenant.tenant_service import TenantService

if TYPE_CHECKING:
    from app.domains.observability.observability_dto import AuditLogDTO
    from app.models.tenant import Tenant


class TenantController:
    @staticmethod
    def create_tenant(data: dict) -> "Tenant":

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        return TenantService.create_tenant(
            data,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    @staticmethod
    def get_tenant() -> "Tenant":

        return TenantService.get_tenant(g.tenant_id)

    @staticmethod
    def update_tenant(data: dict) -> "Tenant":

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        return TenantService.update_tenant(
            data,
            user_id=int(get_jwt_identity()),
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=g.request_id,
        )

    @staticmethod
    def get_logs() -> Sequence["AuditLogDTO"]:

        return TenantService.get_logs(tenant_id=g.tenant_id)
