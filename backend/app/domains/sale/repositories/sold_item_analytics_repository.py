import logging
from collections.abc import Sequence

from sqlalchemy import Row, func, select

from app.core.helpers.period_service import PeriodService
from app.extensions import db
from app.models.sale import ItemSale

logger = logging.getLogger(__name__)


class SoldItemAnalyticsRepository:
    @staticmethod
    def list_sold_items_by_period(
        tenant_id: int, period: str, quantity: int | None = None
    ) -> Sequence[Row]:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = (
            select(
                ItemSale.name,
                ItemSale.sku,
                ItemSale.product_id,
                func.sum(ItemSale.quantity).label("total_quantity"),
                func.sum(ItemSale.item_price * ItemSale.quantity).label("revenue"),
            )
            .where(
                ItemSale.tenant_id == tenant_id,
                ItemSale.created_at >= start_date,
                ItemSale.created_at < end_date,
            )
            .group_by(ItemSale.name, ItemSale.sku, ItemSale.product_id)
            .order_by(func.sum(ItemSale.quantity).desc())
            .limit(quantity)
        )

        return db.session.execute(stmt).all()

    @staticmethod
    def get_top_product(tenant_id: int, period: str) -> Row | None:
        start_date, end_date = PeriodService.get_period_range(period)

        stmt = (
            select(
                ItemSale.name.label("product_name"),
                func.sum(ItemSale.quantity).label("total_quantity"),
                func.sum(ItemSale.quantity * ItemSale.item_price).label("item_revenue"),
            )
            .where(
                ItemSale.tenant_id == tenant_id,
                ItemSale.created_at.between(start_date, end_date),
            )
            .group_by(ItemSale.name)
            .order_by(func.sum(ItemSale.quantity).desc())
        )

        return db.session.execute(stmt).first()
