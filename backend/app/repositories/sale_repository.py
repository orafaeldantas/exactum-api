import logging

from app.models import Sale
from app.services.helpers.date_service import DateService

logger = logging.getLogger(__name__)


class SaleRepository:
    @staticmethod
    def get_sale(tenant_id, sale_id):

        return Sale.query.filter_by(tenant_id=tenant_id, id=sale_id).first()

    @staticmethod
    def list_sales_by_period(tenant_id, month, year):

        start_date, end_date = DateService.get_month_range(month, year)

        return Sale.query.filter(
            Sale.tenant_id == tenant_id,
            Sale.created_at >= start_date,
            Sale.created_at < end_date,
        ).all()
