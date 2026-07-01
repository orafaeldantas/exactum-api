from dataclasses import dataclass


@dataclass(frozen=True)
class DashboardMetricsDTO:
    active_tenants: int
    blocked_tenants: int
    tenants_created_current_month: int
    active_users: int


@dataclass(frozen=True)
class TenantSummaryDTO: ...


@dataclass(frozen=True)
class SystemHealthDTO: ...
