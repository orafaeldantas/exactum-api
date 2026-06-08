import logging
from collections.abc import Sequence

from sqlalchemy import select

from app.extensions import db
from app.models.sale import ItemSale

logger = logging.getLogger(__name__)


class ItemSaleRepository:
    @staticmethod
    def get_items(tenant_id: int, sale_id: int) -> Sequence[ItemSale]:
        stmt = select(ItemSale).where(
            ItemSale.tenant_id == tenant_id, ItemSale.sale_id == sale_id
        )

        return db.session.scalars(stmt).all()
