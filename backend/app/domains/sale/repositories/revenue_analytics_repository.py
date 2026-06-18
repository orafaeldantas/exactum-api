import logging
from collections.abc import Sequence

from sqlalchemy import Row, func, select

from app.core.helpers.period_service import PeriodService
from app.extensions import db
from app.models.sale import Sale

logger = logging.getLogger(__name__)


class RevenueAnalyticsRepository:
    @staticmethod
    def get_revenue_metrics(tenant_id: int, period: str) -> Row | None:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = select(
            func.sum(Sale.total_price).label("total_revenue"),
            func.avg(Sale.total_price).label("average_ticket"),
            func.count(Sale.id).label("total_sales"),
            func.sum(Sale.quantity_items).label("total_products_sold"),
        ).where(
            Sale.tenant_id == tenant_id,
            Sale.created_at.between(start_date, end_date),
        )

        return db.session.execute(stmt).first()

    @staticmethod
    def get_payment_methods_metrics(tenant_id: int, period: str) -> Sequence[Row]:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = (
            select(
                Sale.payment_method,
                func.count(Sale.id).label("quantity"),
                func.sum(Sale.total_price).label("revenue"),
            )
            .where(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .group_by(Sale.payment_method)
            .order_by(func.sum(Sale.total_price).desc())
        )

        return db.session.execute(stmt).all()

    @staticmethod
    def get_daily_revenue(tenant_id: int, period: str) -> Sequence[Row]:
        start_date, end_date = PeriodService.get_period_range(period)

        date_expr = func.date(Sale.created_at)

        stmt = (
            select(
                date_expr.label("day"),
                func.sum(Sale.total_price).label("revenue_day"),
            )
            .where(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .group_by(date_expr)
            .order_by(date_expr)
        )

        return db.session.execute(stmt).all()

    @staticmethod
    def get_ticket_average(tenant_id: int, period: str) -> Row | None:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = select(func.avg(Sale.total_price).label("average_ticket")).where(
            Sale.tenant_id == tenant_id,
            Sale.created_at.between(start_date, end_date),
        )

        return db.session.execute(stmt).first()

    @staticmethod
    def get_quantity_of_orders(tenant_id: int, period: str) -> Row | None:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = select(func.count(Sale.id).label("quantity_order")).where(
            Sale.tenant_id == tenant_id,
            Sale.created_at.between(start_date, end_date),
        )

        return db.session.execute(stmt).first()

    @staticmethod
    def get_biggest_lowest_sale(tenant_id: int, period: str) -> Row | None:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = select(
            func.max(Sale.total_price).label("biggest_sale"),
            func.min(Sale.total_price).label("lowest_sale"),
        ).where(
            Sale.tenant_id == tenant_id,
            Sale.created_at.between(start_date, end_date),
        )

        return db.session.execute(stmt).first()

    @staticmethod
    def get_monthly_average_ticket_by_year(
        tenant_id: int, period: str
    ) -> Sequence[Row]:
        start_date, end_date = PeriodService.get_period_range(period, force_year=True)

        month_trunc = func.date_trunc("month", Sale.created_at)

        stmt = (
            select(
                month_trunc.label("month"),
                func.avg(Sale.total_price).label("average_ticket"),
            )
            .where(
                Sale.tenant_id == tenant_id,
                Sale.created_at >= start_date,
                Sale.created_at < end_date,
            )
            .group_by(month_trunc)
            .order_by(month_trunc)
        )

        return db.session.execute(stmt).all()

    @staticmethod
    def get_weekday_average_ticket(tenant_id: int, period: str) -> Sequence[Row]:
        start_date, end_date = PeriodService.get_period_range(period)

        dow_extract = func.extract("dow", Sale.created_at)

        stmt = (
            select(
                dow_extract.label("weekday"),
                func.avg(Sale.total_price).label("average_ticket"),
            )
            .where(
                Sale.tenant_id == tenant_id,
                Sale.created_at.between(start_date, end_date),
            )
            .group_by(dow_extract)
            .order_by(dow_extract)
        )

        return db.session.execute(stmt).all()
