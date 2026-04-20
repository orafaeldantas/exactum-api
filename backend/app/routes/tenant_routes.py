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