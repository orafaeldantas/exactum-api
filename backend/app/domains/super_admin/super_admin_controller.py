from app.domains.super_admin.super_admin_service import SuperAdminService


class SuperAdminController:
    @staticmethod
    def list_all_tenants():

        return SuperAdminService.list_all_tenants()

    @staticmethod
    def impersonate(tenant_id):

        return SuperAdminService.impersonate(tenant_id)
