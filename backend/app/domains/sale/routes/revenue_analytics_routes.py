from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.rbac.decorators.permissions import permission_required
from app.domains.sale.controllers.revenue_analytics_controller import (
    RevenueAnalyticsController,
)
from app.domains.sale.schemas.revenue_analytics_schema import (
    ListAccumulatedRevenueDaySchema,
    ListRevenueAnalyticsResponseSchema,
    RevenueAnalyticsQuerySchema,
    TicketAverageSchema,
)

blp_revenue_analytics = Blueprint(
    "analytics-revenue",
    __name__,
    url_prefix="/analytics/revenue",
    description="Revenue operations",
)


@blp_revenue_analytics.route("/")
class RevenueAnalyticsListRoute(MethodView):
    @jwt_required()
    @permission_required("analytics:view")
    @blp_revenue_analytics.doc(security=[{"CookieAuth": []}])
    @blp_revenue_analytics.arguments(RevenueAnalyticsQuerySchema, location="query")
    @blp_revenue_analytics.response(200, ListRevenueAnalyticsResponseSchema)
    def get(self, query_params):

        return RevenueAnalyticsController.get_revenue_by_period(query_params)


@blp_revenue_analytics.route("/accumulated-revenue-day")
class AccumulatedRevenueDayRoute(MethodView):
    @jwt_required()
    @permission_required("analytics:view")
    @blp_revenue_analytics.doc(security=[{"CookieAuth": []}])
    @blp_revenue_analytics.arguments(RevenueAnalyticsQuerySchema, location="query")
    @blp_revenue_analytics.response(200, ListAccumulatedRevenueDaySchema(many=True))
    def get(self, query_params):

        return RevenueAnalyticsController.get_accumulated_revenue_day(query_params)


@blp_revenue_analytics.route("/ticket-average")
class AverageTicketRoute(MethodView):
    @jwt_required()
    @permission_required("analytics:view")
    @blp_revenue_analytics.doc(security=[{"CookieAuth": []}])
    @blp_revenue_analytics.arguments(RevenueAnalyticsQuerySchema, location="query")
    @blp_revenue_analytics.response(200, TicketAverageSchema)
    def get(self, query_params):

        return RevenueAnalyticsController.get_average_ticket_dashboard(query_params)
