from app.domains.super_admin.super_admin_repository import SuperAdminRepository


class SuperAdminService:
    @staticmethod
    def list_all_tenants():

        return SuperAdminRepository.list_all_tenants()
