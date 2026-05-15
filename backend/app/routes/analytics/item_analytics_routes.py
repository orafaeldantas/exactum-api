from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from app.schemas.analytics.item_analytics_schema import (
    ListItemAnalyticsQuerySchema, 
    ListItemAnalyticsResponseSchema
)

from app.controllers.analytics.item_analytics_controller import ItemAnalyticsController

from app.security import owner_required, role_authorization


blp_item_analytics = Blueprint(
    "analytics-items",
    __name__,
    url_prefix="/analytics/items",
    description="Item Analytics operations"
)


@blp_item_analytics.route("/best-sellers")
class ItemAnalyticsListRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_item_analytics.doc(security=[{"BearerAuth": []}])
    @blp_item_analytics.arguments(ListItemAnalyticsQuerySchema, location="query")
    @blp_item_analytics.response(200, ListItemAnalyticsResponseSchema)
    def get(self, query_params):

        return ItemAnalyticsController.get_top_product(query_params)
