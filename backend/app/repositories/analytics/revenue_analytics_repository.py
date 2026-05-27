import logging

from app.extensions import db
from app.models import Sale
from app.services.helpers.date_service import DateService

logger = logging.getLogger(__name__)


class RevenueAnalyticsRepository:
    @staticmethod
    def get_revenue_metrics(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(
                db.func.sum(Sale.total_price).label("total_revenue"),
                db.func.avg(Sale.total_price).label("average_ticket"),
                db.func.count(Sale.id).label("total_sales"),
                db.func.sum(Sale.quantity_items).label("total_products_sold"),
            )
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .first()
        )

    @staticmethod
    def get_payment_methods_metrics(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(
                Sale.payment_method,
                db.func.count(Sale.id).label("quantity"),
                db.func.sum(Sale.total_price).label("revenue"),
            )
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .group_by(Sale.payment_method)
            .order_by(db.func.sum(Sale.total_price).desc())
            .all()
        )

    @staticmethod
    def get_daily_revenue(tenant_id, period):
        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(
                db.func.date(Sale.created_at).label("day"),
                db.func.sum(Sale.total_price).label("revenue_day"),
            )
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .group_by(db.func.date(Sale.created_at))
            .order_by(db.func.date(Sale.created_at))
            .all()
        )

    @staticmethod
    def get_ticket_average(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(db.func.avg(Sale.total_price).label("average_ticket"))
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .first()
        )

    @staticmethod
    def get_quantity_of_orders(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(db.func.count(Sale.id).label("quantity_order"))
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .first()
        )

    @staticmethod
    def get_biggest_lowest_sale(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(
                db.func.max(Sale.total_price).label("biggest_sale"),
                db.func.min(Sale.total_price).label("lowest_sale"),
            )
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .first()
        )

    @staticmethod
    def get_monthly_average_ticket_by_year(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period, force_year=True)

        return (
            db.session.query(
                db.func.date_trunc("month", Sale.created_at).label("month"),
                db.func.avg(Sale.total_price).label("average_ticket"),
            )
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at >= start_date,
                Sale.created_at < end_date,
            )
            .group_by("month")
            .order_by("month")
            .all()
        )

    @staticmethod
    def get_weekday_average_ticket(tenant_id, period):

        start_date, end_date = DateService.get_period_range(period)

        return (
            db.session.query(
                db.func.extract("dow", Sale.created_at).label("weekday"),
                db.func.avg(Sale.total_price).label("average_ticket"),
            )
            .filter(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .group_by("weekday")
            .order_by("weekday")
            .all()
        )
