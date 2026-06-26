from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.rbac.decorators.permissions import permission_required
from app.domains.sale.controllers.sold_item_analytics_controller import (
    SoldItemAnalyticsController,
)
from app.domains.sale.schemas.sold_item_analytics_schema import (
    BestSellersSchema,
    SoldItemQuerySchema,
    SoldItemSchema,
)

blp_item_analytics = Blueprint(
    "analytics-items",
    __name__,
    url_prefix="/analytics/sold-items",
    description="Items Sold Analytics",
)


@blp_item_analytics.route("/best-sellers")
class BestSellersResource(MethodView):
    @jwt_required()
    @permission_required("analytics:view")
    @blp_item_analytics.doc(security=[{"CookieAuth": []}])
    @blp_item_analytics.arguments(SoldItemQuerySchema, location="query")
    @blp_item_analytics.response(200, BestSellersSchema(many=True))
    def get(self, query_params):

        return SoldItemAnalyticsController.list_best_sellers_by_period(query_params)


@blp_item_analytics.route("/")
class SoldItemRoute(MethodView):
    @jwt_required()
    @permission_required("analytics:view")
    @blp_item_analytics.doc(security=[{"CookieAuth": []}])
    @blp_item_analytics.arguments(SoldItemQuerySchema, location="query")
    @blp_item_analytics.response(200, SoldItemSchema(many=True))
    def get(self, query_params):

        return SoldItemAnalyticsController.list_sold_items_by_period(query_params)
