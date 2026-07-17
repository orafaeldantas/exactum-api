from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.exc import IntegrityError

from app.database.session import DatabaseSession
from app.domains.observability.observability_constants import AuditEvents
from app.domains.observability.observability_containers import audit_service
from app.domains.observability.observability_dto import AuditLogDTO
from app.domains.product.product_exceptions import ExistingProductField, ProductNotFound
from app.domains.product.product_repository import ProductRepository
from app.models.product import Product


class ProductService:
    @staticmethod
    def list_all_products(tenant_id: int) -> Sequence[Product]:

        return ProductRepository.list_all_products(tenant_id)

    @staticmethod
    def create_product(
        data: dict, user_id: int, user_uuid: UUID, tenant_id: int, tenant_uuid: UUID
    ) -> Product:

        product = Product(
            tenant_id=tenant_id,
            name=data.get("name"),
            description=data.get("description"),
            price=data.get("price"),
            stock_quantity=data.get("stock_quantity"),
            sku=data.get("sku"),
            category=data.get("category", "Not defined"),
            is_active=data.get("is_active"),
        )

        try:
            DatabaseSession.add(product)
            DatabaseSession.commit()

            audit_service.create_log(
                AuditLogDTO(
                    event=AuditEvents.PRODUCT_CREATED,
                    tenant_id=tenant_id,
                    user_id=user_id,
                    user_uuid=user_uuid,
                    tenant_uuid=tenant_uuid,
                    entity="product",
                    payload={
                        "entity_uuid": str(product.uuid),
                        "data": {
                            "name": product.name,
                            "price": float(product.price),
                            "stock_quantity": product.stock_quantity,
                            "is_active": product.is_active,
                        },
                    },
                )
            )

            return product

        except IntegrityError:
            DatabaseSession.rollback()
            raise ExistingProductField()

    @staticmethod
    def get_product(tenant_id: int, product_uuid: UUID) -> Product:

        product = ProductRepository.get_product(tenant_id, product_uuid)

        if not product:
            raise ProductNotFound()

        return product

    @staticmethod
    def update_product(
        data: dict,
        product_uuid: UUID,
        user_id: int,
        user_uuid: UUID,
        tenant_id: int,
        tenant_uuid: UUID,
    ) -> Product:

        product = ProductRepository.get_product(tenant_id, product_uuid)

        if not product:
            raise ProductNotFound()

        changes = {}

        allowed_fields = {
            "name",
            "description",
            "price",
            "sku",
            "category",
            "is_active",
            "stock_quantity",
        }

        for field, new_value in data.items():
            if field not in allowed_fields:
                continue

            old_value = getattr(product, field) or ""

            if field == "price":
                if old_value != new_value:
                    changes[field] = {
                        "old": float(old_value),
                        "new": float(new_value),
                    }

                    setattr(product, field, new_value)

            if (old_value != new_value) and (field != "price"):
                changes[field] = {
                    "old": old_value,
                    "new": new_value,
                }

                setattr(product, field, new_value)

        try:
            if not changes:
                return

            DatabaseSession.commit()
            audit_service.create_log(
                AuditLogDTO(
                    event=AuditEvents.PRODUCT_UPDATED,
                    tenant_id=tenant_id,
                    tenant_uuid=tenant_uuid,
                    user_id=user_id,
                    user_uuid=user_uuid,
                    entity="product",
                    payload={
                        "entity_uuid": str(product.uuid),
                        "name": product.name,
                        "changes": changes,
                    },
                )
            )

            return product

        except IntegrityError:
            DatabaseSession.rollback()
            raise ExistingProductField()

    @staticmethod
    def delete_product(
        product_uuid: UUID,
        user_id: int,
        user_uuid: UUID,
        tenant_id: int,
        tenant_uuid: UUID,
    ) -> None:

        product = ProductRepository.get_product(tenant_id, product_uuid)

        if not product:
            raise ProductNotFound()

        ProductRepository.delete_product(product)

        audit_service.create_log(
            AuditLogDTO(
                event=AuditEvents.PRODUCT_DELETED,
                tenant_id=tenant_id,
                tenant_uuid=tenant_uuid,
                user_id=user_id,
                user_uuid=user_uuid,
                entity="product",
                payload={
                    "entity_uuid": str(product.uuid),
                    "deleted_data": {
                        "name": product.name,
                        "sku": product.sku,
                        "price": float(product.price),
                        "stock_quantity": product.stock_quantity,
                    },
                },
            )
        )
