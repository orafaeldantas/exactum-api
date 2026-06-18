from dataclasses import dataclass


@dataclass
class SessionTokens:
    access_token: str
    refresh_token: str


@dataclass
class RefreshSession:
    user_id: int
    tenant_id: int
    impersonator_id: int | None = None
