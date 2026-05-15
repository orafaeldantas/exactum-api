from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from app.schemas.tenant_schema import (
    CreateTenantSchema, ResponseTenantSchema,
    UdateTenantSchema, ResponseCreateTenantSchema,
    ResponseUdateTenantSchema
)

from app.controllers.tenant_controller import TenantController

from app.security import owner_required, role_authorization


blp_tenants = Blueprint(
    "tenants",
    __name__,
    url_prefix="/tenants",
    description="Tenants operations"
)


@blp_tenants.route("/")
class TenantCreateRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_tenants.doc(security=[{"BearerAuth": []}])
    @blp_tenants.response(200, ResponseTenantSchema)
    def get(self):

        return TenantController.get_tenant()

    @blp_tenants.arguments(CreateTenantSchema)
    @blp_tenants.response(201, ResponseCreateTenantSchema)
    def post(self, data):

        return TenantController.create_tenant(data)
    
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_tenants.doc(security=[{"BearerAuth": []}])
    @blp_tenants.arguments(UdateTenantSchema)
    @blp_tenants.response(201, ResponseUdateTenantSchema)
    def patch(self, data):

        return TenantController.update_tenant(data)

        