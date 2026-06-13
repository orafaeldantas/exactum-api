from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.controllers.product_controller import ProductController
from app.schemas.product_schema import (
    CreateProductResponseSchema,
    CreateProductSchema,
    GetProductResponseSchema,
    ListProductResponseSchema,
    UpdateProductResponseSchema,
    UpdateProductSchema,
)
from app.security import role_authorization

blp_products = Blueprint(
    "products", __name__, url_prefix="/products", description="Product operations"
)


@blp_products.route("/")
class ProductListRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.arguments(CreateProductSchema)
    @blp_products.response(201, CreateProductResponseSchema)
    def post(self, data):

        return ProductController.create_product(data)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.response(200, ListProductResponseSchema(many=True))
    def get(self):

        return ProductController.list_all_products()


@blp_products.route("/<int:product_id>")
class ProductDetailRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.arguments(UpdateProductSchema)
    @blp_products.response(200, UpdateProductResponseSchema)
    def patch(self, data, product_id):

        return ProductController.update_product(data, product_id)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.response(200, GetProductResponseSchema)
    def get(self, product_id):

        return ProductController.get_product(product_id)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.response(204)
    def delete(self, product_id):

        ProductController.delete_product(product_id)

        return ""
