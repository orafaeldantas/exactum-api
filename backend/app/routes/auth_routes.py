from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity
from app.models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(username=data["username"], is_active=True).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={
        "username": user.username,
        "role": user.role
    }
)

    return jsonify(access_token=access_token)


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():

    user_id = get_jwt_identity()

    claims = get_jwt()
    username = claims.get("username")
    role = claims.get("role")

    return {"id": user_id, 
            "username": username,
            "role": role
    }



