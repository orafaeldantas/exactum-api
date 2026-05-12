from flask import Blueprint, request, jsonify
import logging
from app.services import tenant_service
from flask_jwt_extended import jwt_required
from app.security import role_authorization

logger = logging.getLogger(__name__)
tenant_bp = Blueprint("tenants", __name__, url_prefix="/tenants")

@tenant_bp.route("/create", methods=["POST"])
def create():
    data = request.json

    tenant = tenant_service.create_tenant(data)
    
    return jsonify({"message":tenant}), 201


@tenant_bp.route("/data", methods=["GET"])
@jwt_required()
@role_authorization(["admin", "super-admin"])
def get_tenant_data():
    
    tenant = tenant_service.get_tenant_by_id()
    goal = tenant_service.get_goal()

    return jsonify(
        {
            "name": tenant.name,
            "corporate_email": tenant.corporate_email,
            "global_min_stock": tenant.global_min_stock,
            "goal": goal.value  
        }
                   
    ), 200


@tenant_bp.route("/data", methods=["PATCH"])
@jwt_required()
@role_authorization(["admin", "super-admin"])
def update_tenant_data():

    data = request.json

    tenant = tenant_service.update_tenant_by_id(data)
    goal = tenant_service.create_goal(data)

    if tenant or goal:
        return jsonify({"error":"the procedure could not be completed"}), 400
    
    return jsonify({"success":"updated data"}), 200
