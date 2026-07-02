from collections.abc import Sequence
from typing import TYPE_CHECKING

from app.domains.platform.platform_dto import DashboardMetricsDTO
from app.domains.platform.platform_repository import PlatformRepository

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class PlatformService:
    @staticmethod
    def list_all_tenants() -> Sequence["Tenant"]:

        return PlatformRepository.list_all_tenants()

    @staticmethod
    def get_dashboard_metrics() -> DashboardMetricsDTO:

        repository = PlatformRepository()

        return DashboardMetricsDTO(
            active_tenants=repository.count_active_tenants(),
            blocked_tenants=repository.count_blocked_tenants(),
            tenants_created_current_month=repository.count_tenants_created_current_month(),
            active_users=repository.count_active_users(),
            last_tenants_registered=repository.get_last_tenants_registered(),
        )
