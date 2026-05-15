from app.extensions import db
from app.models import Product
import logging

logger = logging.getLogger(__name__)

class ProductRepository:

    @staticmethod
    def list_all_products(tenant_id):

        return Product.query.filter_by(tenant_id=tenant_id).all()
    
    @staticmethod
    def get_product(product_id):

        return Product.query.filter_by(id=product_id).first()
    