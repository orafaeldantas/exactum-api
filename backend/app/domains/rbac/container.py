from app.domains.rbac.rbac_repository import RBACRepository
from app.domains.rbac.rbac_service import RBACService
from app.extensions import redis_client

rbac_repository = RBACRepository()

rbac_service = RBACService(
    repo=rbac_repository,
    cache=redis_client,
)
