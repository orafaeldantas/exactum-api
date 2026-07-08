import re
from decimal import Decimal
from uuid import UUID

from app.database.session import DatabaseSession
from app.domains.goal.goal_exceptions import RegistrationFailedGoal
from app.domains.goal.goal_repository import GoalRepository
from app.domains.observability.observability_constants import PlatformEvents
from app.domains.observability.observability_containers import platform_service
from app.domains.observability.observability_dto import PlatformEventDTO
from app.domains.rbac.container import get_rbac_service
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
    def create_tenant(
        data: dict,
        ip_address: str,
        user_agent: str,
    ) -> Tenant:

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
            fantasy_name=company.get("fantasy_name"),
            cnpj=clean_cnpj,
            plan=plan.get("type"),
            slug=company.get("slug"),
        )

        DatabaseSession.add(tenant)
        DatabaseSession.flush()

        get_rbac_service().create_default_roles(tenant.id)
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

        if not role_admin:
            raise KeyError("Not found role")

        RBACRepository().add_user_role(user.id, role_admin.id)

        DatabaseSession.commit()

        platform_service.create_log(
            PlatformEventDTO(
                event=PlatformEvents.TENANT_CREATED,
                tenant_id=tenant.id,
                user_id=user.id,
                user_uuid=user.uuid,
                tenant_uuid=tenant.uuid,
                payload={
                    "tenant_name": tenant.name,
                    "tenant_plan": tenant.plan,
                    "created_by_email": user.email,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                },
            )
        )

        return tenant

    @staticmethod
    def get_tenant(tenant_id: int) -> Tenant:

        tenant = TenantRepository.get_tenant(tenant_id)

        if not tenant:
            raise TenantNotFound()

        return tenant

    @staticmethod
    def update_tenant(
        data: dict,
        user_id: int,
        user_uuid: UUID,
        tenant_id: int,
        tenant_uuid: UUID,
        ip_address: str,
        user_agent: str,
        request_id: str,
    ) -> Tenant:

        tenant = TenantRepository.get_tenant(tenant_id)

        if not tenant:
            raise TenantNotFound()

        changes = {}

        allowed_fields = {
            "name",
            "corporate_email",
            "global_min_stock",
        }

        for field, new_value in data.items():
            if field not in allowed_fields:
                continue

            old_value = getattr(tenant, field)

            if old_value != new_value:
                changes[field] = {
                    "old": old_value,
                    "new": new_value,
                }

                setattr(tenant, field, new_value)

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

        platform_service.create_log(
            PlatformEventDTO(
                event=PlatformEvents.TENANT_UPDATED,
                tenant_id=tenant_id,
                tenant_uuid=tenant_uuid,
                user_id=user_id,
                user_uuid=user_uuid,
                payload={
                    "tenant_name": tenant.name,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "request_id": request_id,
                    "changes": changes,
                },
            )
        )

        return tenant
