from flask import Blueprint, request, jsonify
import logging
from app.services import tenant_service

logger = logging.getLogger(__name__)
tenant_bp = Blueprint("tenants", __name__, url_prefix="/tenants")

@tenant_bp.route("/create", methods=["POST"])
def create():
    data = request.json

    tenant = tenant_service.create_tenant(data)
    
    return jsonify({"message":tenant}), 201

@tenant_bp.route("/data", methods=["GET"])
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
