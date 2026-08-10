import logging
from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select

from app.core.helpers.period_service import PeriodService
from app.extensions import db
from app.models.sale import Sale

logger = logging.getLogger(__name__)


class SaleRepository:
    @staticmethod
    def get_sale(tenant_id: int, sale_uuid: UUID) -> Sale | None:
        stmt = select(Sale).where(Sale.tenant_id == tenant_id, Sale.uuid == sale_uuid)

        return db.session.scalars(stmt).first()

    @staticmethod
    def list_sales_by_period(tenant_id: int, month: int, year: int) -> Sequence[Sale]:
        start_date, end_date = PeriodService.get_month_range(month, year)

        stmt = select(Sale).where(
            Sale.tenant_id == tenant_id,
            Sale.created_at >= start_date,
            Sale.created_at < end_date,
        )

        return db.session.scalars(stmt).all()
