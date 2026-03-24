from functools import wraps
from flask import jsonify, g
import logging

logger = logging.getLogger(__name__)

def owner_required(param_name="user_id"):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token_user_id = g.user_id
            resource_user_id = kwargs.get(param_name)

            logger.info(f"Token user_id: {token_user_id}")
            logger.info(f"Resource user_id: {resource_user_id}")
            logger.info(f"Role: {g.role}")

            if g.role == 'admin':
                return fn(*args, **kwargs)
                
            if resource_user_id is None:
                return jsonify({"error": f"Parameter '{param_name}' not found"}), 400

            if str(token_user_id) != str(resource_user_id):
                return jsonify({"error": "Forbidden: You are not the owner"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


# RBAC - Role Based Access Control
def role_authorization(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):

            if g.role == role:
                return fn(*args, **kwargs)
                
            return jsonify({"error": "Forbidden: You are not authorized"}), 403
        return wrapper
    return decorator


def tenant_required():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not g.tenant_id:
                return {"error": "Tenant not found"}, 400
        
            return fn(*args, **kwargs)
        return wrapper
    return decorator

