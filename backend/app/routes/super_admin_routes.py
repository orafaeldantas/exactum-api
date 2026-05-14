from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from schemas.super_admin_schema import (
    SuperAdminListImpersonateResponseSchema, 
    SuperAdminListTenantsResponseSchema
)

from controllers.super_admin_controller import SuperAdminController

from app.security import owner_required, role_authorization


blp_super_admin = Blueprint(
    "super_admin",
    __name__,
    url_prefix="/super-admin",
    description="Super admin operations"
)


@blp_super_admin.route("/tenants")
@jwt_required()
@role_authorization(["super-admin"])
class SuperAdminListTenantsRoute(MethodView):

    @blp_super_admin.response(200, SuperAdminListTenantsResponseSchema, many=True)
    def get(self):

        return SuperAdminController.list_tenants()


@blp_super_admin.route("/impersonate/<int:tenant_id>")
@jwt_required()
@role_authorization(["super-admin"])
class SuperAdminListImpersonatesRoute(MethodView):

    @blp_super_admin.response(201, SuperAdminListImpersonateResponseSchema)
    def post(self, tenant_id):

        return SuperAdminController.impersonate(tenant_id)
