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

@user_bp.route("", methods=["GET"])
@jwt_required()
def list():
    authorize_route(0, "admin")

    users = user_service.list_users()

    usersFormated = []

    for u in users:
       usersFormated.append({
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "is_active": u.is_active
        })

    return usersFormated

@user_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
@owner_required()
def update(user_id):
    
    user = user_service.get_user(user_id)
    if not user:
        return jsonify({"error": "User not found"}, 404)
    
    data = request.json

    user_service.update_user(user_id, data)

    return {"message": "User update"}