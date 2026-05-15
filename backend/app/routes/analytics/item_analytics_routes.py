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
@jwt_required()
@role_authorization(["admin", "super-admin", "user"])
class ItemAnalyticsListRoute(MethodView):


    @blp_item_analytics.arguments(ListItemAnalyticsQuerySchema, location="query")
    @blp_item_analytics.response(200, ListItemAnalyticsResponseSchema(many=True))
    def get(self, query_params):

        return ItemAnalyticsController.list_items_by_period(query_params)



"""
    @sale_bp.route("/five-items", methods=["GET"])
    @jwt_required()
    @role_authorization(['user', 'admin', 'super-admin'])
    def list_best_selling_items():

        month = int(request.args.get('month'))
        year = int(request.args.get('year'))

        items = sales_service.list_top_items(month, year)

        return jsonify([
            
                {
                "id": i.id,
                "name": i.name,
                "quantity": i.quantity,
                "sku": i.sku,
                "item_price": i.item_price
                }
                for i in items 

            ]), 200
"""