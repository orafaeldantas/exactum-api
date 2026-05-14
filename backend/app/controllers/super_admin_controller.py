from flask import g
from services.user_service import SuperAdminService


class SuperAdminController:

    @staticmethod
    def list_tenants():

        return SuperAdminService.list_tenants()
    
    @staticmethod
    def impersonate(tenant_id):

        return SuperAdminService.impersonate(tenant_id)
