from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from schemas.tenant_schema import (
    CreateTenantSchema, ResponseTenantSchema,
    UdateTenantSchema
)

from controllers.tenant_controller import TenantController

from app.security import owner_required, role_authorization


blp_tenants = Blueprint(
    "tenants",
    __name__,
    url_prefix="/tenants",
    description="Tenants operations"
)


@blp_tenants.route("/")
class TenantCreateRoute(MethodView):

    @blp_tenants.response(201, ResponseTenantSchema)
    def get():

        return TenantController.get_tenant()

    @blp_tenants.arguments(CreateTenantSchema)
    @blp_tenants.response(201, ResponseTenantSchema)
    def post(self, data):

        return TenantController.create_tenant(data)
    
    @blp_tenants.arguments(UdateTenantSchema)
    @blp_tenants.response(201, UdateTenantSchema)
    def patch(self, data):

        return TenantController.update_tenant(data)

        