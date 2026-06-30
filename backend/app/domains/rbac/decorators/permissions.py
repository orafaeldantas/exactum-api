from functools import wraps

from flask import g

from app.domains.rbac.container import get_rbac_service
from app.domains.rbac.rbac_exceptions import ForbiddenException


def permission_required(permission: str):

    def decorator(func):

        @wraps(func)
        def wrapper(*args, **kwargs):

            if getattr(g, "is_super_admin", False):
                return func(*args, **kwargs)

            permissions = get_rbac_service().get_effective_permissions(g.user_id)

            if permission not in permissions:
                raise ForbiddenException()

            return func(*args, **kwargs)

        return wrapper

    return decorator
