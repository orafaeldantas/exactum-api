from app.extensions import db

from app.models import Sale

from app.services.helpers.date_service import DateService

import logging

logger = logging.getLogger(__name__)


class RevenueAnalyticsRepository:

    @staticmethod
    def get_revenue_metrics(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return db.session.query(
            db.func.sum(Sale.total_price)
                .label("total_revenue"),

            db.func.avg(Sale.total_price)
                .label("average_ticket"),

            db.func.count(Sale.id)
                .label("total_sales"),

            db.func.sum(
                Sale.quantity_items
            ).label("total_products_sold")
        ).filter(
            Sale.tenant_id == tenant_id,
            Sale.created_at.between(start_date, end_date)
        ).first()
    

    @staticmethod
    def get_payment_methods_metrics(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return db.session.query(

            Sale.payment_method,

            db.func.count(
                Sale.id
            ).label("quantity"),

            db.func.sum(
                Sale.total_price
            ).label("revenue")

        ).filter(

            Sale.tenant_id == tenant_id,

            Sale.created_at.between(start_date, end_date)

        ).group_by(

            Sale.payment_method

        ).order_by(

            db.func.sum(Sale.total_price).desc()

        ).all()