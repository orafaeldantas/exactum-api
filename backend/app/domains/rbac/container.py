from app.domains.rbac.rbac_repository import RBACRepository
from app.domains.rbac.rbac_service import RBACService

_rbac_service: RBACService | None = None


def init_rbac_container(redis) -> None:
    global _rbac_service

    repository = RBACRepository()

    _rbac_service = RBACService(
        repo=repository,
        cache=redis,
    )


def get_rbac_service() -> RBACService:
    if _rbac_service is None:
        raise RuntimeError(
            "RBACService not initialized. Did you call init_rbac_container()?"
        )

    return _rbac_service
