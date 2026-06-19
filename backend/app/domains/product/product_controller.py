from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask import g

from app.domains.product.product_service import ProductService

if TYPE_CHECKING:
    from app.models.product import Product


class ProductController:
    @staticmethod
    def create_product(data: dict) -> "Product":

        return ProductService.create_product(data, g.tenant_id)

    @staticmethod
    def list_all_products() -> Sequence["Product"]:

        return ProductService.list_all_products(g.tenant_id)

    @staticmethod
    def get_product(product_uuid: UUID) -> "Product":

        return ProductService.get_product(product_uuid)

    @staticmethod
    def update_product(data: dict, product_uuid: UUID) -> "Product":

        return ProductService.update_product(data, product_uuid)

    @staticmethod
    def delete_product(product_uuid: UUID) -> None:

        ProductService.delete_product(product_uuid)
