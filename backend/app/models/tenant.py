from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import UUID as SQLUUID
from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.identifiers.uuid_generator import UUIDGenerator
from app.extensions import Base

if TYPE_CHECKING:
    from app.models.user import User


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=UUIDGenerator.generate,
    )

    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    plan: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=True, nullable=True)

    fantasy_name: Mapped[str | None] = mapped_column(String(120), default=None)
    cnpj: Mapped[str | None] = mapped_column(String(18), unique=True, default=None)
    corporate_email: Mapped[str | None] = mapped_column(
        String(255), unique=True, default=None
    )

    global_min_stock: Mapped[int | None] = mapped_column(default=10)

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))

    users: Mapped[list["User"]] = relationship(back_populates="tenant")
