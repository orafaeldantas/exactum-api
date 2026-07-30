from functools import wraps

from flask import g

from app.core.cache.cache_keys import CacheKeys
from app.core.cache.cache_service import CacheService
from app.domains.auth.auth_exceptions import RefreshTokenRevoked
from app.domains.rbac.container import get_rbac_service
from app.domains.rbac.rbac_exceptions import ForbiddenException


def permission_required(permission: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if getattr(g, "is_super_admin", False):
                return func(*args, **kwargs)

            permissions = get_rbac_service().get_effective_permissions(
                g.tenant_id, g.user_id
            )

            if CacheService().get(CacheKeys.blocklist_tenant(g.tenant_id)):
                raise RefreshTokenRevoked()
            elif CacheService().get(CacheKeys.blocklist_user(g.tenant_id, g.user_id)):
                raise RefreshTokenRevoked()
            else:
                if permission not in permissions:
                    raise ForbiddenException()
                return func(*args, **kwargs)

        return wrapper

    return decorator
