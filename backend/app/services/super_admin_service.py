from repositories.tenant_repository import TenantRepository
from repositories.user_repository import UserRepository

from services.token_service import TokenService


class SuperAdminService:

    @staticmethod
    def list_tenants():

        return TenantRepository.list_all_tenant()
    
    def impersonate(tenant_id):
          
        target_admin =  UserRepository.get_user_by_role(tenant_id, "admin")
        
        impersonate_token = TokenService.generate_access_token(target_admin)

        return impersonate_token