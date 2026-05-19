from app.models import User, Tenant
import logging

logger = logging.getLogger(__name__)

class SuperAdminRepository:
    
    @staticmethod
    def list_all_tenants():

        return Tenant.query.execution_options(skip_tenant_filter=True).all()


    @staticmethod
    def impersonate(tenant_id):
 
        return User.query.execution_options(skip_tenant_filter=True).filter_by(tenant_id=tenant_id, role="admin").first()