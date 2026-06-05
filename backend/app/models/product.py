from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"))

    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(255), default=None)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    stock_quantity: Mapped[int] = mapped_column(default=0)
    sku: Mapped[str] = mapped_column(String(255), unique=True)
    category: Mapped[str] = mapped_column(String(120))

    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
