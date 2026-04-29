from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import create_access_token, jwt_required
from app.models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data.get("email"), is_active=True).first()
    

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
  
    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={
        "tenant_id": user.tenant_id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "password_reset": user.password_reset
    }
)

    return jsonify(access_token=access_token)


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():

    user_id = g.user_id
    username = g.username
    email = g.email
    tenant = g.tenant_id
    role = g.role
    password_reset = g.password_reset

    return {"id": user_id,
            "tenant": tenant, 
            "username": username,
            "email": email,
            "role": role,
            "password_reset": password_reset
    }



