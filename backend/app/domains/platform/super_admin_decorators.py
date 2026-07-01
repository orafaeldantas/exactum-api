from functools import wraps

from flask import g

from app.domains.platform.super_admin_exceptions import AuthorizationNotPermitted


def require_super_admin(fn):

    @wraps(fn)
    def wrapper(*args, **kwargs):

        if not g.is_super_admin:
            raise AuthorizationNotPermitted()

        return fn(*args, **kwargs)

    return wrapper
