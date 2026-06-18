from flask import g

from app.domains.tenant.tenant_service import TenantService


class TenantController:
    @staticmethod
    def create_tenant(data):

        return TenantService.create_tenant(data)

    @staticmethod
    def get_tenant():

        return TenantService.get_tenant(g.tenant_id)

    @staticmethod
    def update_tenant(data):

        return TenantService.update_tenant(g.tenant_id, data)
