from flask import Blueprint, request, jsonify
from app.extensions import jwt
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(username=data["username"], is_active=True)
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = jwt.create_access_token(identify=user.id)

    return jsonify(access_token=access_token)
