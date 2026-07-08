from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.platform.platform_controller import PlatformController
from app.domains.platform.platform_decorators import require_super_admin
from app.domains.platform.platform_schema import (
    DashboardMetricsResponseSchema,
    GetInfraLogsSchema,
    GetPlatformEventsSchema,
    ListTenantsResponseSchema,
    UdateStatusTenantSchema,
)

if TYPE_CHECKING:
    from app.domains.observability.observability_dto import PlatformEventDTO
    from app.domains.platform.platform_dto import DashboardMetricsDTO, TenantSummaryDTO

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
    def get(self) -> Sequence["TenantSummaryDTO"]:

        return PlatformController.list_all_tenants()


@blp_platform.route("/events")
class GetPlatformEvents(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_platform.doc(security=[{"CookieAuth": []}])
    @blp_platform.response(200, GetPlatformEventsSchema(many=True))
    def get(self) -> list["PlatformEventDTO"]:

        return PlatformController.get_platform_events()


@blp_platform.route("/logs")
class GetInfraLogs(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_platform.doc(security=[{"CookieAuth": []}])
    @blp_platform.response(200, GetInfraLogsSchema)
    def get(self) -> dict:

        return PlatformController.get_infra_logs()


@blp_platform.route("/dashboard")
class GetPlatformDashboardRoute(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_platform.doc(security=[{"CookieAuth": []}])
    @blp_platform.response(200, DashboardMetricsResponseSchema)
    def get(self) -> "DashboardMetricsDTO":
        return PlatformController.get_dashboard_metrics()


@blp_platform.route("/status/tenant/<uuid:tenant_uuid>")
class StatusTenantRoute(MethodView):
    @jwt_required()
    @require_super_admin
    @blp_platform.doc(security=[{"CookieAuth": []}])
    @blp_platform.arguments(UdateStatusTenantSchema)
    @blp_platform.response(200)
    def patch(self, data: dict, tenant_uuid: UUID) -> None:

        return PlatformController.update_status_tenant(data, tenant_uuid)
