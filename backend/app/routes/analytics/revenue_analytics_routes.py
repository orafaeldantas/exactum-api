from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from app.schemas.analytics.revenue_analytics_schema import (
    ListRevenueAnalyticsQuerySchema, 
    ListRevenueAnalyticsResponseSchema,
    ListAccumulatedRevenueDaySchema
)

from app.controllers.analytics.revenue_analytics_controller import RevenueAnalyticsController

from app.security import owner_required, role_authorization


blp_revenue_analytics = Blueprint(
    "analytics-revenue",
    __name__,
    url_prefix="/analytics/revenue",
    description="Revenue operations"
)


@blp_revenue_analytics.route("/")
class RevenueAnalyticsListRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_revenue_analytics.doc(security=[{"BearerAuth": []}])
    @blp_revenue_analytics.arguments(ListRevenueAnalyticsQuerySchema, location="query")
    @blp_revenue_analytics.response(200, ListRevenueAnalyticsResponseSchema)
    def get(self, query_params):

        return RevenueAnalyticsController.list_revenue_by_period(query_params)
    
@blp_revenue_analytics.route("/accumulated-revenue-day")
class AccumulatedRevenueDayRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_revenue_analytics.doc(security=[{"BearerAuth": []}])
    @blp_revenue_analytics.arguments(ListRevenueAnalyticsQuerySchema, location="query")
    @blp_revenue_analytics.response(200, ListAccumulatedRevenueDaySchema(many=True))
    def get(self, query_params):

        return RevenueAnalyticsController.list_accumulated_revenue_day(query_params)