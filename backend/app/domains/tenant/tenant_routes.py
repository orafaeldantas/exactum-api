from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.core.security.security import role_authorization
from app.domains.tenant.tenant_controller import TenantController
from app.domains.tenant.tenant_schema import (
    CreateTenantSchema,
    ResponseCreateTenantSchema,
    ResponseTenantSchema,
    ResponseUdateTenantSchema,
    UdateTenantSchema,
)

blp_tenants = Blueprint(
    "tenants", __name__, url_prefix="/tenants", description="Tenants operations"
)


@blp_tenants.route("/")
class TenantRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_tenants.doc(security=[{"CookieAuth": []}])
    @blp_tenants.response(200, ResponseTenantSchema)
    def get(self):

        return TenantController.get_tenant()

    @blp_tenants.arguments(CreateTenantSchema)
    @blp_tenants.response(201, ResponseCreateTenantSchema)
    def post(self, data):

        return TenantController.create_tenant(data)

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_tenants.doc(security=[{"CookieAuth": []}])
    @blp_tenants.arguments(UdateTenantSchema)
    @blp_tenants.response(200, ResponseUdateTenantSchema)
    def patch(self, data):

        return TenantController.update_tenant(data)
