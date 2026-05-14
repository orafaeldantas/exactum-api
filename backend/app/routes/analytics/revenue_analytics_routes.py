from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from schemas.analytics.revenue_analytics_schema import (
    ListRevenueAnalyticsQuerySchema, 
    ListRevenueAnalyticsResponseSchema
)

from controllers.analytics.revenue_analytics_controller import RevenueAnalyticsController

from app.security import owner_required, role_authorization


blp_item_analytics = Blueprint(
    "analytics-revenue",
    __name__,
    url_prefix="/analytics/revenue",
    description="Item Analytics operations"
)


@blp_item_analytics.route("/")
@jwt_required()
@role_authorization(["admin", "super-admin", "user"])
class RevenueAnalyticsListRoute(MethodView):


    @blp_item_analytics.arguments(ListRevenueAnalyticsQuerySchema, location="query")
    @blp_item_analytics.response(200, ListRevenueAnalyticsResponseSchema)
    def get(self, query_params):

        return RevenueAnalyticsController.list_revenue_by_period(query_params)