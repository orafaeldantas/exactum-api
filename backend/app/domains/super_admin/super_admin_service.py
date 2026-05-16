from app.repositories.tenant_repository import TenantRepository
from app.repositories.user_repository import UserRepository
from app.domains.super_admin.super_admin_repository import SuperAdminRepository

from app.services.token_service import TokenService


class SuperAdminService:

    @staticmethod
    def list_all_tenants():

        return SuperAdminRepository.list_all_tenants()
    
    
    @staticmethod
    def impersonate(tenant_id):
          
        target_admin = SuperAdminRepository.impersonate(tenant_id)

        impersonate_token = TokenService.generate_access_token(target_admin, impersonate=True)

        return {"impersonate_token": impersonate_token}
