import logging

from app.models import ItemSale

# from app.services.helpers.date_service import DateService

logger = logging.getLogger(__name__)


class ItemSaleRepository:
    @staticmethod
    def get_items(tenant_id, sale_id):

        return ItemSale.query.filter_by(tenant_id=tenant_id, sale_id=sale_id).all()
