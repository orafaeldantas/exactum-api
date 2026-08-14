from collections.abc import Sequence
from uuid import UUID

from app.database.session import DatabaseSession
from app.domains.observability.observability_constants import AuditEvents
from app.domains.observability.observability_containers import audit_service
from app.domains.observability.observability_dto import AuditLogDTO
from app.domains.product.product_repository import ProductRepository
from app.domains.sale.repositories.item_sale_repository import ItemSaleRepository
from app.domains.sale.repositories.sale_repository import SaleRepository
from app.domains.sale.sale_exceptions import ProductNotFound, SaleNotFound
from app.models.sale import ItemSale, Sale


class SaleService:
    @staticmethod
    def create_sale(
        data: dict, user_id: int, user_uuid: UUID, tenant_id: int, tenant_uuid: UUID
    ) -> Sale:

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
            product = ProductRepository.get_product(tenant_id, item.get("uuid"))

            if not product:
                raise ProductNotFound()

            new_item = ItemSale(
                name=item.get("name"),
                quantity=item.get("quantity"),
                sku=item.get("sku"),
                category=product.category,
                item_price=item.get("item_price"),
                sale_id=new_sale.id,
                tenant_id=tenant_id,
                user_id=user_id,
                product_id=product.id,
                product_uuid=product.uuid,
                channel=sale.get("channel"),
            )

            DatabaseSession.add(new_item)

            remaining_stock = product.stock_quantity - new_item.quantity

            new_stock = remaining_stock if remaining_stock > 0 else 0

            product.stock_quantity = new_stock

        DatabaseSession.commit()

        audit_service.create_log(
            AuditLogDTO(
                event=AuditEvents.SALE_CREATED,
                tenant_id=tenant_id,
                user_id=user_id,
                user_uuid=user_uuid,
                tenant_uuid=tenant_uuid,
                entity="sale",
                payload={
                    "entity_uuid": str(new_sale.uuid),
                    "data": {
                        "total_price": float(new_sale.total_price),
                        "payment_method": new_sale.payment_method,
                        "quantity_items": new_sale.quantity_items,
                        "channel": new_sale.channel,
                    },
                },
            )
        )

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
