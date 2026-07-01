from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.platform.platform_controller import SuperAdminController
from app.domains.platform.platform_decorators import require_super_admin
from app.domains.platform.platform_schema import (
    SuperAdminListTenantsResponseSchema,
)

if TYPE_CHECKING:
    from app.models.tenant import Tenant

blp_plaform = Blueprint(
    "platform",
    __name__,
    url_prefix="/platform",
    description="Platform operations",
)


@blp_plaform.route("/tenants")
class ListTenantsRoute(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_plaform.doc(security=[{"CookieAuth": []}])
    @blp_plaform.response(200, SuperAdminListTenantsResponseSchema(many=True))
    def get(self) -> Sequence["Tenant"]:

        return SuperAdminController.list_all_tenants()


@blp_plaform.route("/dashboard")
class GetSystemDashboardRoute(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_plaform.doc(security=[{"CookieAuth": []}])
    def get(self) -> dict:

        return SuperAdminController.get_system_dashboard()
