from collections.abc import Sequence
from dataclasses import dataclass


@dataclass(frozen=True)
class DashboardMetricsDTO:
    active_tenants: int
    blocked_tenants: int
    tenants_created_current_month: int
    active_users: int
    last_tenants_registered: Sequence


@dataclass(frozen=True)
class TenantSummaryDTO: ...


@dataclass(frozen=True)
class SystemHealthDTO: ...
