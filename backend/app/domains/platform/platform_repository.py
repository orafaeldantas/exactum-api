import logging
from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import desc, func, select

from app.core.helpers.period_service import PeriodService
from app.domains.rbac.rbac_repository import RBACRepository
from app.extensions import db
from app.models.tenant import Tenant
from app.models.user import User

logger = logging.getLogger(__name__)


class PlatformRepository:
    @staticmethod
    def list_all_tenants() -> Sequence[tuple[Tenant, int]]:
        """Search all tenants in the system, ignoring filters."""
        stmt = (
            select(Tenant, func.count(User.id).label("users_count"))
            .outerjoin(User, Tenant.id == User.tenant_id)
            .group_by(Tenant.id)
            .order_by(Tenant.name)
            .execution_options(skip_tenant_filter=True)
        )

        return db.session.execute(stmt).all()

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

        tenant_stmt = select(Tenant).where(Tenant.uuid == tenant_uuid)
        tenant = db.session.scalar(tenant_stmt)

        if not tenant:
            raise KeyError("Not found tenant")

        role = RBACRepository().get_role_admin_by_tenant(tenant.id)

        if not role:
            raise KeyError("Not found role")

        user_role = RBACRepository().get_user_by_role_id(role.id)

        if not user_role:
            raise KeyError("Not found role")

        user_stmt = (
            select(User)
            .where(User.tenant_id == int(tenant.id), User.id == user_role.user_id)
            .execution_options(skip_tenant_filter=True)
        )
        return db.session.scalar(user_stmt)

    @staticmethod
    def count_active_tenants() -> int:

        stmt = (
            select(func.count())
            .select_from(Tenant)
            .where(Tenant.is_active)
            .execution_options(skip_tenant_filter=True)
        )

        return db.session.scalar(stmt)

    @staticmethod
    def count_blocked_tenants() -> int:

        stmt = (
            select(func.count())
            .select_from(Tenant)
            .where(not Tenant.is_active)
            .execution_options(skip_tenant_filter=True)
        )

        return db.session.scalar(stmt)

    @staticmethod
    def count_tenants_created_current_month() -> int:

        start_date, end_date = PeriodService.get_period_range("month")

        stmt = (
            select(func.count())
            .select_from(Tenant)
            .where(Tenant.created_at.between(start_date, end_date))
            .execution_options(skip_tenant_filter=True)
        )

        return db.session.scalar(stmt)

    @staticmethod
    def count_active_users() -> int:

        stmt = (
            select(func.count())
            .select_from(User)
            .where(User.is_active)
            .execution_options(skip_tenant_filter=True)
        )

        return db.session.scalar(stmt)

    @staticmethod
    def get_last_tenants_registered() -> Sequence[Tenant]:

        stmt = (
            select(Tenant)
            .order_by(desc(Tenant.created_at))
            .limit(5)
            .execution_options(skip_tenant_filter=True)
        )

        return db.session.scalars(stmt)
