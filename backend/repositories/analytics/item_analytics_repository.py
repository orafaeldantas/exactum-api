
from app.extensions import db

from app.models import ItemSale

from app.services.helpers.date_service import DateService

import logging

logger = logging.getLogger(__name__)

class ItemAnalyticsRepository:

    @staticmethod
    def list_items_by_period(tenant_id, month, year):

        start_date, end_date = ( DateService.get_month_range(month, year))

        return db.session.query(
            ItemSale.name,
            ItemSale.sku,
            db.func.sum(
                ItemSale.quantity
            ).label("total_quantity")
        ).filter(
            ItemSale.tenant_id == tenant_id,
            ItemSale.created_at >= start_date,
            ItemSale.created_at < end_date
        ).group_by(
            ItemSale.name,
            ItemSale.sku
        ).order_by(
            db.func.sum(
                ItemSale.quantity
            ).desc()
        ).limit(5).all()