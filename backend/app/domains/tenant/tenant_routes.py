from typing import TYPE_CHECKING

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.rbac.decorators.permissions import permission_required
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

if TYPE_CHECKING:
    from app.models.tenant import Tenant


@blp_tenants.route("/")
class TenantRoute(MethodView):
    @jwt_required()
    @permission_required("tenant:view")
    @blp_tenants.doc(security=[{"CookieAuth": []}])
    @blp_tenants.response(200, ResponseTenantSchema)
    def get(self) -> "Tenant":

        return TenantController.get_tenant()

    @blp_tenants.arguments(CreateTenantSchema)
    @blp_tenants.response(201, ResponseCreateTenantSchema)
    def post(self, data: dict) -> "Tenant":

        return TenantController.create_tenant(data)

    @jwt_required()
    @permission_required("tenant:update")
    @blp_tenants.doc(security=[{"CookieAuth": []}])
    @blp_tenants.arguments(UdateTenantSchema)
    @blp_tenants.response(200, ResponseUdateTenantSchema)
    def patch(self, data: dict) -> "Tenant":

        return TenantController.update_tenant(data)
