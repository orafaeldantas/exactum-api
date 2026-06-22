from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask import g

from app.domains.sale.services.sale_service import SaleService

if TYPE_CHECKING:
    from app.models.sale import Sale


class SaleController:
    @staticmethod
    def create_sale(data: dict) -> "Sale":

        return SaleService.create_sale(data, g.tenant_id, g.user_id)

    @staticmethod
    def list_sales_by_period(query_params: dict) -> Sequence["Sale"]:

        return SaleService.list_sales_by_period(
            g.tenant_id, month=query_params["month"], year=query_params["year"]
        )

    @staticmethod
    def list_sale_with_items(sale_id: UUID) -> dict:

        return SaleService.list_sale_with_items(sale_id, g.tenant_id)
