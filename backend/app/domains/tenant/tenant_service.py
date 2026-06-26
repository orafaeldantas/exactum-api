import re
from decimal import Decimal

from app.database.session import DatabaseSession
from app.domains.goal.goal_exceptions import RegistrationFailedGoal
from app.domains.goal.goal_repository import GoalRepository
from app.domains.rbac.container import rbac_service
from app.domains.rbac.rbac_service import RBACRepository
from app.domains.tenant.tenant_exceptions import TenantNotFound
from app.domains.tenant.tenant_repository import TenantRepository
from app.domains.user.user_exceptions import (
    InvalidPasswordException,
    PasswordMismatchException,
)
from app.models.tenant import Tenant
from app.models.user import User


class TenantService:
    @staticmethod
    def create_tenant(data: dict) -> Tenant:

        company = data.get("company", {})
        admin = data.get("admin", {})
        plan = data.get("plan", {})

        # Clean the cnpj to retrieve only the numbers
        raw_cnpj = company.get("cnpj", "")
        clean_cnpj = re.sub(r"\D", "", raw_cnpj)

        if admin.get("password") != admin.get("confirmPassword"):
            raise PasswordMismatchException()

        if len(admin.get("password")) < 8:
            raise InvalidPasswordException()

        tenant = Tenant(
            name=company.get("name"),
            fantasy_name=company.get("fantasyName"),
            cnpj=clean_cnpj,
            plan=plan.get("type"),
            slug=company.get("slug"),
        )

        DatabaseSession.add(tenant)
        DatabaseSession.flush()

        rbac_service.create_default_roles(tenant.id)
        DatabaseSession.flush()

        user = User(
            username=f"{admin.get('firstName')} {admin.get('lastName')}",
            email=admin.get("email"),
            tenant_id=tenant.id,
            is_active=True,
            password_reset=False,
        )

        user.set_password(admin.get("password"))

        DatabaseSession.add(user)
        DatabaseSession.flush()

        role_admin = RBACRepository().get_role_admin_by_tenant(tenant.id)

        RBACRepository().add_user_role(user.id, role_admin.id)

        DatabaseSession.commit()

        return tenant

    @staticmethod
    def get_tenant(tenant_id: int) -> Tenant:

        tenant = TenantRepository.get_tenant(tenant_id)

        if not tenant:
            raise TenantNotFound()

        return tenant

    @staticmethod
    def update_tenant(tenant_id: int, data: dict) -> Tenant:

        tenant = TenantRepository.get_tenant(tenant_id)

        if not tenant:
            raise TenantNotFound()

        update_fields = ["name", "corporate_email", "global_min_stock"]

        for field in update_fields:
            if field in data:
                setattr(tenant, field, data[field])

        DatabaseSession.add(tenant)

        target_goal = data.get("monthly_goal")

        if target_goal:
            goal = GoalRepository.get_goal(tenant_id)
            if goal:
                goal.value = Decimal(target_goal)

            else:
                goal = GoalRepository.create_goal(Decimal(target_goal), tenant_id)

            if not goal:
                raise RegistrationFailedGoal()

            DatabaseSession.add(goal)

        DatabaseSession.commit()

        return tenant
