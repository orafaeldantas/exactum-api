from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import Base

if TYPE_CHECKING:
    from app.models.tenant import Tenant


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"))

    username: Mapped[str] = mapped_column(String(80), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    is_active: Mapped[bool] = mapped_column(default=True)
    password_reset: Mapped[bool] = mapped_column(default=True)
    role: Mapped[str] = mapped_column(String(20), default="user")

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))

    tenant: Mapped["Tenant"] = relationship(back_populates="users")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)
