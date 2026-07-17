from dataclasses import dataclass
from uuid import UUID


@dataclass(slots=True, frozen=True)
class GetUserDTO:
    uuid: UUID
    username: str | None
    is_active: bool | None
    email: str | None
    role: str | None
    role_uuid: UUID | None
