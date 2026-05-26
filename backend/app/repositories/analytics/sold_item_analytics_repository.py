
from app.extensions import db

from app.models import ItemSale

from app.services.helpers.date_service import DateService

import logging

logger = logging.getLogger(__name__)

class SoldItemAnalyticsRepository:

    @staticmethod
    def list_sold_items_by_period(tenant_id, period, quantity=None):

        start_date, end_date = DateService.get_period_range(period)

        return db.session.query(
            ItemSale.name,
            ItemSale.sku,
            ItemSale.product_id,
            db.func.sum(
                ItemSale.quantity
            ).label("total_quantity"),
            db.func.sum(
                ItemSale.item_price * ItemSale.quantity
            ).label("revenue")
        ).filter(
            ItemSale.tenant_id == tenant_id,
            ItemSale.created_at >= start_date,
            ItemSale.created_at < end_date
        ).group_by(
            ItemSale.name,
            ItemSale.sku,
            ItemSale.product_id
        ).order_by(
            db.func.sum(
                ItemSale.quantity
            ).desc()
        ).limit(quantity).all()
    
    def get_top_product(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return db.session.query(

            ItemSale.name.label("product_name"),
            db.func.sum(ItemSale.quantity).label("total_quantity"),
            db.func.sum(ItemSale.quantity * ItemSale.item_price).label("item_revenue")

        ).filter(
            ItemSale.tenant_id == tenant_id,
            ItemSale.created_at.between(start_date, end_date)

        ).group_by(
            ItemSale.name,

        ).order_by(
            db.func.sum(
                ItemSale.quantity
            ).desc()
        ).first()

