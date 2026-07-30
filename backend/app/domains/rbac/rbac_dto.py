from dataclasses import dataclass
from typing import TypedDict
from uuid import UUID


class PermissionDict(TypedDict):
    id: int | None
    code: str | None
    description: str | None


@dataclass(slots=True, frozen=True)
class RoleWithPermissionsDTO:
    uuid: UUID | None
    name: str | None
    permissions: list[PermissionDict]
