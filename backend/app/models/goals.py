from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True)

    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"))

    type: Mapped[str] = mapped_column(String(50))

    year: Mapped[int] = mapped_column()
    month: Mapped[int] = mapped_column()
    value: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    description: Mapped[str | None] = mapped_column(String(255), default=None)

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))
