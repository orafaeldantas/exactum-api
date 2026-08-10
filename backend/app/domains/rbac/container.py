from app.core.cache.cache_service import CacheService
from app.domains.rbac.rbac_repository import RBACRepository
from app.domains.rbac.rbac_service import RBACService


def get_rbac_service() -> RBACService:

    repository = RBACRepository()
    redis = CacheService()

    return RBACService(
        repo=repository,
        cache=redis,
    )
