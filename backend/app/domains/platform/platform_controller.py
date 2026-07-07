from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask import g, request

from app.domains.platform.platform_service import PlatformService

if TYPE_CHECKING:
    from app.domains.platform.platform_dto import DashboardMetricsDTO, TenantSummaryDTO


class PlatformController:
    @staticmethod
    def list_all_tenants() -> Sequence["TenantSummaryDTO"]:

        return PlatformService.list_all_tenants()

    @staticmethod
    def get_dashboard_metrics() -> "DashboardMetricsDTO":

        return PlatformService.get_dashboard_metrics()

    @staticmethod
    def update_status_tenant(data, tenant_uuid) -> None:

        ip_address = request.remote_addr
        user_agent = request.headers.get("User-Agent")

        return PlatformService.update_status_tenant(
            data, tenant_uuid, g.user_id, ip_address, user_agent, g.request_id
        )
