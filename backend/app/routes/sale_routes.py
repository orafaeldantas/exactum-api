from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from schemas.sale_schema import (
    CreateSaleSchema, CreateSaleResponseSchema,
    ListSaleResponseSchema, ListSaleWithItemsResponseSchema,
    ListSaleQuerySchema
)

from controllers.sale_controller import SaleController

from app.security import owner_required, role_authorization


blp_sales = Blueprint(
    "sales",
    __name__,
    url_prefix="/sales",
    description="Sale operations"
)


@blp_sales.route("/")
@jwt_required()
@role_authorization(["admin", "super-admin", "user"])
class SaleListRoute(MethodView):

    @blp_sales.arguments(CreateSaleSchema)
    @blp_sales.response(201, CreateSaleResponseSchema)
    def post(self, data):

        return SaleController.create_sale(data)

    @blp_sales.arguments(ListSaleQuerySchema, location="query")
    @blp_sales.response(200, ListSaleResponseSchema(many=True))
    def get(self, query_params):

        return SaleController.list_sales_by_period(query_params)


@blp_sales.route("/<int:sale_id>")
@jwt_required()    
@role_authorization(["admin", "super-admin", "user"])
class SaleDetailRoute(MethodView):

    @blp_sales.response(200, ListSaleWithItemsResponseSchema)
    def get(self, sale_id):

        return SaleController.list_sale_with_items(sale_id)
    