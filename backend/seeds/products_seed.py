import logging
import random

from app.extensions import db
from app.models.product import Product

logger = logging.getLogger(__name__)


def products_database_seed(tenant_id: int, products: dict):
    """Create the corresponding tenant's productss"""
    try:
        for name, sku, price in products.values():
            new_product = Product(
                name=name,
                sku=sku,
                price=price,
                category="Geral",
                tenant_id=tenant_id,
                stock_quantity=random.randint(5, 25),
            )
            db.session.add(new_product)

        db.session.commit()

        logger.info(f"Created products (tenant_id: {tenant_id})")

        return True

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating products: {e}")
        return False
