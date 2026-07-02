from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.platform.platform_controller import PlatformController
from app.domains.platform.platform_decorators import require_super_admin
from app.domains.platform.platform_schema import (
    DashboardMetricsResponseSchema,
    ListTenantsResponseSchema,
)

if TYPE_CHECKING:
    from app.domains.platform.platform_dto import DashboardMetricsDTO
    from app.models.tenant import Tenant

blp_platform = Blueprint(
    "platform",
    __name__,
    url_prefix="/platform",
    description="Platform operations",
)


@blp_platform.route("/tenants")
class ListTenantsRoute(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_platform.doc(security=[{"CookieAuth": []}])
    @blp_platform.response(200, ListTenantsResponseSchema(many=True))
    def get(self) -> Sequence["Tenant"]:

        return PlatformController.list_all_tenants()


@blp_platform.route("/dashboard")
class GetPlatformDashboardRoute(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_platform.doc(security=[{"CookieAuth": []}])
    @blp_platform.response(200, DashboardMetricsResponseSchema)
    def get(self) -> "DashboardMetricsDTO":
        return PlatformController.get_dashboard_metrics()
