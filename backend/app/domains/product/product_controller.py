from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask import g

from app.domains.product.product_service import ProductService

if TYPE_CHECKING:
    from app.models.product import Product


class ProductController:
    @staticmethod
    def create_product(data: dict) -> Product:

        return ProductService.create_product(
            data,
            user_id=g.user_id,
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
        )

    @staticmethod
    def list_all_products() -> Sequence[Product]:

        return ProductService.list_all_products(g.tenant_id)

    @staticmethod
    def get_product(product_uuid: UUID) -> Product:

        return ProductService.get_product(g.tenant_id, product_uuid)

    @staticmethod
    def update_product(data: dict, product_uuid: UUID) -> Product | None:

        return ProductService.update_product(
            data,
            product_uuid,
            user_id=g.user_id,
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
        )

    @staticmethod
    def delete_product(product_uuid: UUID) -> None:

        ProductService.delete_product(
            product_uuid,
            user_id=g.user_id,
            user_uuid=g.user_uuid,
            tenant_id=g.tenant_id,
            tenant_uuid=g.tenant_uuid,
        )
