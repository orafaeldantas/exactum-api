from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from schemas.product_schema import (
    CreateProductSchema, CreateProductResponseSchema,
    ListProductResponseSchema, UpdateProductSchema,
    UpdateProductResponseSchema, GetProductResponseSchema,
    DeleteProductResponseSchema
)

from controllers.product_controller import ProductController

from app.security import owner_required, role_authorization


blp_products = Blueprint(
    "products",
    __name__,
    url_prefix="/products",
    description="Product operations"
)


@blp_product.route("/")
@jwt_required()
@role_authorization(["admin", "super-admin", "users"])
class ProductListRoute(MethodView):

    @blp_product.arguments(CreateProductSchema)
    @blp_product.response(201, CreateProductResponseSchema)
    def post(self, data):

        return ProductController.create_product()

    
    @blp_product.response(200, ListProductResponseSchema(many=True))
    def get(self):

        return ProductController.list_all_products()
    
    
@blp_product.route("/int:<product_id>")
@jwt_required()
@role_authorization(["admin", "super-admin", "users"])
class ProductDetailRoute(MethodView):
    
    @blp_product.arguments(UpdateProductSchema)
    @blp_product.response(201, UpdateProductResponseSchema)
    def patch(self, data, product_id):

        return ProductController.update_product(data, product_id)
    
    @blp_product.response(200, GetProductResponseSchema)
    def get(self, product_id):

        return ProductController.get_product(product_id)
    
    @blp_product.response(200, DeleteProductResponseSchema)
    def delete(self, product_id):

        return ProductController.delete_product(product_id)

