from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import user_service
from app.security import owner_required, authorize_route

user_bp = Blueprint("users", __name__, url_prefix="/users")

@user_bp.route("/create", methods=["POST"])
@jwt_required()
def create():
    authorize_route(0, "admin")
    
    data = request.json

    user = user_service.create_user(data)
    return jsonify({"id": user.id}), 201