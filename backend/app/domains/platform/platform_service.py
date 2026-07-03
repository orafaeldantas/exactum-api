from collections.abc import Sequence
from typing import TYPE_CHECKING

from app.database.session import DatabaseSession
from app.domains.platform.platform_dto import DashboardMetricsDTO, TenantSummaryDTO
from app.domains.platform.platform_exceptions import ResourceNotFound
from app.domains.platform.platform_repository import PlatformRepository
from app.domains.tenant.tenant_repository import TenantRepository

if TYPE_CHECKING:
    pass


class PlatformService:
    @staticmethod
    def list_all_tenants() -> Sequence[TenantSummaryDTO]:

        repository = PlatformRepository()

        raw_data = repository.list_all_tenants()

        tenants_dto = [
            TenantSummaryDTO(tenant=tenant, users_count=count)
            for tenant, count in raw_data
        ]

        return tenants_dto

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

    @staticmethod
    def update_status_tenant(data, tenant_uuid) -> None:

        tenant = TenantRepository.get_tenant_by_uuid(tenant_uuid)

        if not tenant:
            raise ResourceNotFound("Not found tenant")

        new_status = data.get("is_active")

        tenant.is_active = new_status

        DatabaseSession.commit()
