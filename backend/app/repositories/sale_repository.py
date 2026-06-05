import logging
from collections.abc import Sequence

from sqlalchemy import select

from app.extensions import db
from app.models.sale import Sale
from app.services.helpers.date_service import DateService

logger = logging.getLogger(__name__)


class SaleRepository:
    @staticmethod
    def get_sale(tenant_id: int, sale_id: int) -> Sale | None:
        stmt = select(Sale).where(Sale.tenant_id == tenant_id, Sale.id == sale_id)

        return db.session.scalars(stmt).first()

    @staticmethod
    def list_sales_by_period(tenant_id: int, month: int, year: int) -> Sequence[Sale]:
        start_date, end_date = DateService.get_month_range(month, year)

        stmt = select(Sale).where(
            Sale.tenant_id == tenant_id,
            Sale.created_at >= start_date,
            Sale.created_at < end_date,
        )

        return db.session.scalars(stmt).all()
