from flask import Blueprint, request, jsonify
from app.services import tenant_service
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from app.security import role_authorization
from flask import g
from app.models import User

superadmin_bp = Blueprint("superadmin", __name__, url_prefix="/superadmin")


@superadmin_bp.route("/companies", methods=["GET"])
@jwt_required()
@role_authorization(['super-admin'])
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
        if t.id > 0 
    ])


@superadmin_bp.route("/impersonate/<int:tenant_id>", methods=["POST"])
@jwt_required()
@role_authorization(['super-admin'])
def impersonate(tenant_id):
    

    target_admin = User.query.filter_by(tenant_id=tenant_id, role='admin').first()

    token = create_access_token(
        identity=str(target_admin.id),
        additional_claims={
            "tenant_id": tenant_id,
            "role": "admin",
            "is_impersonating": True,
            "real_admin_id": get_jwt_identity()
        }
    )

    return jsonify(token=token)

