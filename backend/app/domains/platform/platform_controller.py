from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask import g, request

from app.domains.platform.platform_service import PlatformService

if TYPE_CHECKING:
    from app.domains.observability.observability_dto import PlatformEventDTO
    from app.domains.platform.platform_dto import DashboardMetricsDTO, TenantSummaryDTO


class PlatformController:
    @staticmethod
    def list_all_tenants() -> Sequence["TenantSummaryDTO"]:

        return PlatformService.list_all_tenants()

    @staticmethod
    def get_platform_events() -> Sequence["PlatformEventDTO"]:

        return PlatformService.get_platform_events()

    @staticmethod
    def get_infra_logs() -> dict:

        return PlatformService.get_infra_logs()

    @staticmethod
    def get_dashboard_metrics() -> "DashboardMetricsDTO":

        return PlatformService.get_dashboard_metrics()

    @staticmethod
    def update_status_tenant(data, tenant_uuid) -> None:

        ip_address = str(request.remote_addr)
        user_agent = str(request.headers.get("User-Agent"))

        return PlatformService.update_status_tenant(
            data,
            tenant_uuid,
            g.user_id,
            g.user_uuid,
            ip_address,
            user_agent,
            g.request_id,
        )
