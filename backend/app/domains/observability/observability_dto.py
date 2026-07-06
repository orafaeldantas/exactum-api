from dataclasses import dataclass


@dataclass(slots=True, frozen=True)
class AuditLogDTO:
    tenant_id: int
    user_id: int | None
    event: str
    entity: str
    entity_id: int | None = None
    payload: dict | None = None
    ip_adress: str | None = None


@dataclass(slots=True, frozen=True)
class PlatformEventDTO:
    event: str
    tenant_id: int | None = None
    user_id: int | None = None
    payload: dict | None = None
