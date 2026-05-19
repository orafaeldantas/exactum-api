from app.extensions import db
from app.models import Sale, ItemSale
import logging

#from app.services.helpers.date_service import DateService

logger = logging.getLogger(__name__)

class ItemSaleRepository:

    @staticmethod
    def get_items(tenant_id, sale_id):

        return ItemSale.query.filter_by(tenant_id=tenant_id, sale_id=sale_id).all()
    
