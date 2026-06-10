from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.super_admin.super_admin_controller import SuperAdminController
from app.domains.super_admin.super_admin_schema import (
    SuperAdminListImpersonateResponseSchema,
    SuperAdminListTenantsResponseSchema,
)
from app.security import role_authorization

blp_super_admin = Blueprint(
    "super_admin",
    __name__,
    url_prefix="/super-admin",
    description="Super admin operations",
)


@blp_super_admin.route("/tenants")
class SuperAdminListTenantsRoute(MethodView):
    @jwt_required()
    @role_authorization(["super-admin", "admin"])
    @blp_super_admin.doc(security=[{"BearerAuth": []}])
    @blp_super_admin.response(200, SuperAdminListTenantsResponseSchema(many=True))
    def get(self):

        return SuperAdminController.list_all_tenants()


@blp_super_admin.route("/impersonate/<int:tenant_id>")
class SuperAdminListImpersonatesRoute(MethodView):
    @jwt_required()
    @role_authorization(["super-admin", "admin"])
    @blp_super_admin.doc(security=[{"BearerAuth": []}])
    @blp_super_admin.response(201, SuperAdminListImpersonateResponseSchema)
    def post(self, tenant_id):

        return SuperAdminController.impersonate(tenant_id)
