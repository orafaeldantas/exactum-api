from functools import wraps
from flask import jsonify, abort
from flask_jwt_extended import get_jwt_identity, get_jwt

def owner_required(param_name="user_id"):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):

            claims = get_jwt() 
            token_user_id = get_jwt_identity()
            resource_user_id = kwargs.get(param_name)

            if claims.get("role") == 'admin':
                return fn(*args, **kwargs)

            if resource_user_id is None:
                return jsonify({"error": f"Parameter '{param_name}' not found"}), 400

            if str(token_user_id) != str(resource_user_id):
                return jsonify({"error": "Forbidden: You are not the owner"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def authorize_route(resource_owner_id, role):


    claims = get_jwt()
    current_user_id = get_jwt_identity()

    is_owner = str(current_user_id) == str(resource_owner_id)

    authorization = str(claims.get("role")) in role


    if not is_owner and not authorization:
        abort(403, description="Access denied: only the owner or admin.")
