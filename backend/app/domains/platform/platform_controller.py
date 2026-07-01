from collections.abc import Sequence
from typing import TYPE_CHECKING

from app.domains.platform.platform_service import PlatformService

if TYPE_CHECKING:
    from app.domains.platform.platform_dto import DashboardMetricsDTO
    from app.models.tenant import Tenant


class PlatformController:
    @staticmethod
    def list_all_tenants() -> Sequence["Tenant"]:

        return PlatformService.list_all_tenants()

    @staticmethod
    def get_dashboard_metrics() -> "DashboardMetricsDTO":

        return PlatformService.get_dashboard_metrics()
