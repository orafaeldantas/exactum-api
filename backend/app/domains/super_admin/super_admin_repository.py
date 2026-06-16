import logging
from collections.abc import Sequence

from sqlalchemy import select

from app.extensions import db
from app.models.tenant import Tenant
from app.models.user import User

logger = logging.getLogger(__name__)


class SuperAdminRepository:
    @staticmethod
    def list_all_tenants() -> Sequence[Tenant]:
        """Search all tenants in the system, ignoring filters."""
        stmt = select(Tenant).execution_options(skip_tenant_filter=True)
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_super_admin_user(original_user_id):
        stmt = (
            select(User)
            .where(User.id == original_user_id)
            .execution_options(skip_tenant_filter=True)
        )
        return db.session.scalar(stmt)

    @staticmethod
    def impersonate(tenant_id: int) -> User | None:
        """Search for the administrator user of a specific tenant for impersonation."""

        stmt = (
            select(User)
            .where(User.tenant_id == tenant_id, User.role == "admin")
            .execution_options(skip_tenant_filter=True)
        )
        return db.session.scalars(stmt).first()
