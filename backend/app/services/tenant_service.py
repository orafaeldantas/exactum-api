import re

from app.database.session import DatabaseSession
from app.exceptions.goal_exceptions import RegistrationFailedGoal
from app.exceptions.tenant_exceptions import TenantNotFound
from app.exceptions.user_exceptions import (
    InvalidPasswordException,
    PasswordMismatchException,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.repositories.goal_repository import GoalRepository
from app.repositories.tenant_repository import TenantRepository


class TenantService:
    @staticmethod
    def create_tenant(data):

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

        user = User(
            username=f"{admin.get('firstName')} {admin.get('lastName')}",
            email=admin.get("email"),
            tenant_id=tenant.id,
            is_active=True,
            role="admin",
            password_reset=False,
        )

        user.set_password(admin.get("password"))

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return tenant

    @staticmethod
    def get_tenant(tenant_id):

        tenant = TenantRepository.get_tenant(tenant_id)

        if not tenant:
            raise TenantNotFound()

        return tenant

    @staticmethod
    def update_tenant(tenant_id, data):

        tenant = TenantRepository.get_tenant(tenant_id)

        if not tenant:
            raise TenantNotFound()

        update_fields = ["name", "corporate_email", "global_min_stock"]

        for field in update_fields:
            if field in data:
                setattr(tenant, field, data[field])

        DatabaseSession.add(tenant)

        if data.get("monthly_goal"):
            goal = GoalRepository.get_goal(tenant_id)
            if goal:
                goal.value = data.get("monthly_goal")

            goal = GoalRepository.create_goal(data.get("monthly_goal"), tenant_id)

            if not goal:
                raise RegistrationFailedGoal()

            DatabaseSession.add(goal)

        DatabaseSession.commit()

        return tenant
