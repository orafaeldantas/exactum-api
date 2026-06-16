from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.super_admin.super_admin_controller import SuperAdminController
from app.domains.super_admin.super_admin_schema import (
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
class ListTenantsRoute(MethodView):
    @jwt_required()
    @role_authorization(["super-admin"])
    @blp_super_admin.doc(security=[{"CookieAuth": []}])
    @blp_super_admin.response(200, SuperAdminListTenantsResponseSchema(many=True))
    def get(self):

        return SuperAdminController.list_all_tenants()
