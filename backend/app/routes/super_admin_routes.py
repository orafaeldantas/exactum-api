from flask import Blueprint, request, jsonify
from app.services import tenant_service
from flask_jwt_extended import jwt_required
from app.security import role_authorization
from flask import g

superadmin_bp = Blueprint("superadmin", __name__, url_prefix="/superadmin")


@superadmin_bp.route("/companies", methods=["GET"])
@jwt_required()
@role_authorization(['superadmin', 'admin'])
def list_all_tenants():

    tenants = tenant_service.list_tenants()

    return jsonify([
        {
            "id": t.id,
            "name": t.name,
            "fantasy_name": t.fantasy_name,
            "slug": t.slug,
            "plan": t.plan,
            "cnpj": t.cnpj
        }
        for t in tenants
    ])
