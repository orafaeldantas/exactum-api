from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import UUID as SQLUUID
from sqlalchemy import BigInteger, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.identifiers.uuid_generator import UUIDGenerator
from app.extensions import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=UUIDGenerator.generate,
    )
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    payment_method: Mapped[str] = mapped_column(String(50))
    quantity_items: Mapped[int] = mapped_column(default=1)
    channel: Mapped[str] = mapped_column(String(50), default="physical")

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))

    items: Mapped[list["ItemSale"]] = relationship(back_populates="sale", lazy=True)


class ItemSale(Base):
    __tablename__ = "items_sales"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id"))
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id"), default=None
    )
    sku: Mapped[str] = mapped_column(String(50), ForeignKey("products.sku"))

    name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(default=1)
    item_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    channel: Mapped[str] = mapped_column(String(50), default="physical")

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))

    sale: Mapped["Sale"] = relationship(back_populates="items")
