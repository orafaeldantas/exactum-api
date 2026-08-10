from collections.abc import Sequence
from dataclasses import dataclass

from app.models.tenant import Tenant


@dataclass(frozen=True)
class DashboardMetricsDTO:
    active_tenants: int | None
    blocked_tenants: int | None
    tenants_created_current_month: int | None
    active_users: int | None
    last_tenants_registered: Sequence


@dataclass(frozen=True)
class TenantSummaryDTO:
    tenant: Tenant
    users_count: int


@dataclass(frozen=True)
class SystemHealthDTO: ...
