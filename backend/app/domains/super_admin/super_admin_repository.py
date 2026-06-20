import logging
from collections.abc import Sequence
from uuid import UUID

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
    def get_super_admin_user(original_user_id: int) -> User | None:
        stmt = (
            select(User)
            .where(User.id == original_user_id)
            .execution_options(skip_tenant_filter=True)
        )
        return db.session.scalar(stmt)

    @staticmethod
    def impersonate(tenant_uuid: UUID) -> User | None:
        """Search for the administrator user of a specific tenant for impersonation."""

        stmt = select(Tenant).where(Tenant.uuid == tenant_uuid)
        tenant = db.session.scalar(stmt)

        if not tenant:
            raise

        stmt = (
            select(User)
            .where(User.tenant_id == int(tenant.id), User.role == "admin")
            .execution_options(skip_tenant_filter=True)
        )
        return db.session.scalars(stmt).first()
