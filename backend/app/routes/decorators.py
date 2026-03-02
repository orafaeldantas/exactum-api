from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

def owner_required(param_name="user_id"):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token_user_id = get_jwt_identity()

            resource_user_id = kwargs.get(param_name)

            if resource_user_id is None:
                return jsonify({"error": f"Parameter '{param_name}' not found"}), 400

            if str(token_user_id) != str(resource_user_id):
                return jsonify({"error": "Forbidden: You are not the owner"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
