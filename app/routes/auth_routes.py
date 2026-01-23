from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(username=data["username"], is_active=True).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=str(user.id))

    return jsonify(access_token=access_token)
