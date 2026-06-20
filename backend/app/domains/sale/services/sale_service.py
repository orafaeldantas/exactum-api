from collections.abc import Sequence
from uuid import UUID

from app.database.session import DatabaseSession
from app.domains.product.product_repository import ProductRepository
from app.domains.sale.repositories.item_sale_repository import ItemSaleRepository
from app.domains.sale.repositories.sale_repository import SaleRepository
from app.domains.sale.sale_exceptions import ProductNotFound, SaleNotFound
from app.models.sale import ItemSale, Sale


class SaleService:
    @staticmethod
    def create_sale(data: dict, tenant_id: int, user_id: int) -> Sale:

        sale = data.get("sale", {})
        items = data.get("items", {})

        new_sale = Sale(
            total_price=sale.get("total_price"),
            payment_method=sale.get("payment_method"),
            quantity_items=sale.get("quantity_items"),
            tenant_id=tenant_id,
            user_id=user_id,
            channel=sale.get("channel"),
        )

        DatabaseSession.add(new_sale)
        DatabaseSession.flush()

        for item in items:
            new_item = ItemSale(
                name=item.get("name"),
                quantity=item.get("quantity"),
                sku=item.get("sku"),
                item_price=item.get("item_price"),
                sale_id=new_sale.id,
                tenant_id=tenant_id,
                user_id=user_id,
                product_id=item.get("uuid"),
                channel=sale.get("channel"),
            )

            DatabaseSession.add(new_item)

            product = ProductRepository.get_product(item.get("uuid"))

            if not product:
                raise ProductNotFound()

            remaining_stock = product.stock_quantity - new_item.quantity

            new_stock = remaining_stock if remaining_stock > 0 else 0

            product.stock_quantity = new_stock

        DatabaseSession.commit()

        return new_sale

    @staticmethod
    def list_sale_with_items(sale_uuid: UUID, tenant_id: int) -> dict:

        sale = SaleRepository.get_sale(tenant_id, sale_uuid)

        if not sale:
            raise SaleNotFound()

        items = ItemSaleRepository.get_items(tenant_id, sale.id)

        return {"sale": sale, "items": items}

    @staticmethod
    def list_sales_by_period(tenant_id: int, month: int, year: int) -> Sequence[Sale]:

        return SaleRepository.list_sales_by_period(tenant_id, month, year)
