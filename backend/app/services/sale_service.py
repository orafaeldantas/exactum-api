from app.database.session import DatabaseSession
from app.exceptions.sale_exceptions import SaleNotFound
from app.models import ItemSale, Sale
from app.repositories.item_sale_repository import ItemSaleRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.sale_repository import SaleRepository


class SaleService:
    @staticmethod
    def create_sale(data, tenant_id, user_id):

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
                product_id=item.get("id"),
                channel=sale.get("channel"),
            )

            DatabaseSession.add(new_item)

            product = ProductRepository.get_product(item.get("id"))

            remaining_stock = product.stock_quantity - new_item.quantity

            new_stock = remaining_stock if remaining_stock > 0 else 0

            product.stock_quantity = new_stock

        DatabaseSession.commit()

        return new_sale

    @staticmethod
    def list_sale_with_items(sale_id, tenant_id):

        sale = SaleRepository.get_sale(sale_id, tenant_id)

        if not sale:
            raise SaleNotFound()

        items = ItemSaleRepository.get_items(sale_id, tenant_id)

        return {"sale": sale, "items": items}

    @staticmethod
    def list_sales_by_period(tenant_id, month, year):

        return SaleRepository.list_sales_by_period(tenant_id, month, year)
