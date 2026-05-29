import logging

from app.database.session import DatabaseSession
from app.models.product import Product

logger = logging.getLogger(__name__)


class ProductRepository:
    @staticmethod
    def list_all_products(tenant_id):

        return Product.query.filter_by(tenant_id=tenant_id).all()

    @staticmethod
    def get_product(product_id):

        return Product.query.filter_by(id=product_id).first()

    @staticmethod
    def delete_product(product):

        DatabaseSession.delete(product)
        DatabaseSession.commit()
