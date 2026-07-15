from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True, frozen=True)
class AuditLogDTO:
    tenant_id: int | None
    user_id: int | None
    user_uuid: UUID | None
    tenant_uuid: UUID | None
    event: str
    entity: str
    payload: dict | None
    created_at: datetime | None = None


@dataclass(slots=True, frozen=True)
class PlatformEventDTO:
    event: str
    tenant_id: int | None
    user_id: int | None
    user_uuid: UUID | None
    tenant_uuid: UUID | None
    payload: dict | None
    created_at: datetime | None = None
