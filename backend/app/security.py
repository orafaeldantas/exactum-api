from functools import wraps
from flask import jsonify, abort
from flask_jwt_extended import get_jwt_identity, get_jwt
import logging

logger = logging.getLogger(__name__)

def owner_required(param_name="user_id"):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt() 
            token_user_id = get_jwt_identity()
            resource_user_id = kwargs.get(param_name)

            logger.info(f"Token user_id: {token_user_id}")
            logger.info(f"Resource user_id: {resource_user_id}")
            logger.info(f"Claims: {claims}")

            if claims.get("role") == 'admin':
                logger.info(f"Entrou")
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
            claims = get_jwt() 

            if claims.get("role") == role:
                return fn(*args, **kwargs)
                

            return jsonify({"error": "Forbidden: You are not authorized"}), 403
        return wrapper
    return decorator

