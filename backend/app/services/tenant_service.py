import re

from app.models import User, Tenant, Goal
from repositories.tenant_repository import TenantRepository
from repositories.goal_repository import GoalRepository    

from database.session import DatabaseSession

from exceptions.user_exceptions import PasswordMismatchException
from exceptions.tenant_exceptions import RegistrationFailed, TenantNotFound
from exceptions.goal_exceptions import RegistrationFailedGoal


class TenantService:


    @staticmethod
    def create_tenant(data):

        company = data.get("company", {})
        admin = data.get("admin", {})
        plan = data.get("plan", {})

        # Clean the cnpj to retrieve only the numbers
        raw_cnpj = company.get("cnpj", "")
        clean_cnpj = re.sub(r'\D', '', raw_cnpj)

        if (admin.get("password") != admin.get("confirmPassword")):
            raise PasswordMismatchException()

        tenant = Tenant(
            name=company.get("name"),
            fantasy_name=company.get("fantasyName"),
            cnpj=clean_cnpj,
            plan=plan.get("type"),
            slug=company.get("slug")
        )

        DatabaseSession.add(tenant)
        DatabaseSession.flush()

        user = User(
            username=f"{admin.get('firstName')} {admin.get('lastName')}",
            email=admin.get("email"),
            tenant_id=tenant.id, 
            is_active=True,
            role="admin"
        )

        user.set_password(admin.get("password"))


        DatabaseSession.add(user)
        DatabaseSession.commit()

        if tenant.id and user.id:
            raise RegistrationFailed()

        return tenant.id
    
    @staticmethod
    def get_tenant(tenant_id):
        
        return TenantRepository.get(tenant_id)
    
    @staticmethod
    def list_all_tenants():

        return TenantRepository.list_all_tenants()
    
    @staticmethod
    def update_tenant(tenant_id, data):

        tenant = TenantRepository.get(tenant_id)

        if not tenant_id:

            raise TenantNotFound()

        update_fields = [
            "name",
            "corporate_email",
            "global_min_stock"
        ]

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
        
