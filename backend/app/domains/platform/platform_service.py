from collections.abc import Sequence
from uuid import UUID

from app.core.cache.cache_keys import CacheKeys
from app.core.cache.cache_service import CacheService
from app.core.config.settings import Settings
from app.database.session import DatabaseSession
from app.domains.observability.observability_constants import PlatformEvents
from app.domains.observability.observability_containers import platform_service
from app.domains.observability.observability_dto import PlatformEventDTO
from app.domains.platform.platform_dto import DashboardMetricsDTO, TenantSummaryDTO
from app.domains.platform.platform_exceptions import InfraLogsError, ResourceNotFound
from app.domains.platform.platform_repository import PlatformRepository
from app.domains.tenant.tenant_repository import TenantRepository
from app.infra.observability.request_logger.get_logs import latest_request_logs


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
    def get_platform_events() -> Sequence[PlatformEventDTO]:

        return platform_service.get_logs()

    @staticmethod
    def get_infra_logs() -> dict:

        logs = latest_request_logs()

        if "error" in logs:
            message = logs["error"]
            status_code = logs["status"]
            raise InfraLogsError(message, status_code)

        return logs

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
    def update_status_tenant(
        data: dict,
        tenant_uuid: UUID,
        user_id: int,
        user_uuid: UUID,
        ip_address: str,
        user_agent: str,
        request_id: str,
    ) -> None:

        tenant = TenantRepository.get_tenant_by_uuid(tenant_uuid)

        if not tenant:
            raise ResourceNotFound("Not found tenant")

        new_status = data.get("is_active")
        old_status = tenant.is_active

        tenant.is_active = bool(new_status)

        DatabaseSession.commit()

        if not new_status:
            remove_tenant_session = not new_status

            if remove_tenant_session:
                key_to_remove_tenant_session = f"tenant:{tenant.id}:*"
                CacheService().delete(key_to_remove_tenant_session)

                key_to_put_tenant_black_list = CacheKeys.black_list_tenant(tenant.id)

                value = "Tenant blocked"
                ttl = Settings.black_list_ttl()
                CacheService().set_cache(key_to_put_tenant_black_list, value, ttl)

        platform_service.create_log(
            PlatformEventDTO(
                event=(
                    PlatformEvents.TENANT_SUSPENDED
                    if not new_status
                    else PlatformEvents.TENANT_REACTIVATED
                ),
                tenant_id=tenant.id,
                tenant_uuid=tenant.uuid,
                user_id=user_id,
                user_uuid=user_uuid,
                payload={
                    "request_id": request_id,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "tenant_name": tenant.name,
                    "old_values": {
                        "is_active": old_status,
                    },
                    "new_values": {
                        "is_active": new_status,
                    },
                },
            )
        )
