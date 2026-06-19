import logging
from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select

from app.database.session import DatabaseSession
from app.extensions import db
from app.models.product import Product

logger = logging.getLogger(__name__)


class ProductRepository:
    @staticmethod
    def list_all_products(tenant_id: int) -> Sequence[Product]:
        stmt = select(Product).where(Product.tenant_id == tenant_id)
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_product(product_uuid: UUID) -> Product | None:

        return db.session.get(Product, product_uuid)

    @staticmethod
    def delete_product(product: Product) -> None:
        DatabaseSession.delete(product)
        DatabaseSession.commit()
