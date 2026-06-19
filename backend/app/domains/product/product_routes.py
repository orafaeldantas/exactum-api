from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.core.security.security import role_authorization
from app.domains.product.product_controller import ProductController
from app.domains.product.product_schema import (
    CreateProductResponseSchema,
    CreateProductSchema,
    GetProductResponseSchema,
    ListProductResponseSchema,
    UpdateProductResponseSchema,
    UpdateProductSchema,
)

if TYPE_CHECKING:
    from app.models.product import Product

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
    def post(self, data: dict) -> "Product":

        return ProductController.create_product(data)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.response(200, ListProductResponseSchema(many=True))
    def get(self) -> Sequence["Product"]:

        return ProductController.list_all_products()


@blp_products.route("/<uuid:product_uuid>")
class ProductDetailRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.arguments(UpdateProductSchema)
    @blp_products.response(200, UpdateProductResponseSchema)
    def patch(self, data: dict, product_uuid: UUID) -> "Product":

        return ProductController.update_product(data, product_uuid)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.response(200, GetProductResponseSchema)
    def get(self, product_uuid: UUID) -> "Product":

        return ProductController.get_product(product_uuid)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_products.doc(security=[{"CookieAuth": []}])
    @blp_products.response(204)
    def delete(self, product_uuid: UUID) -> None:

        ProductController.delete_product(product_uuid)

        return None
