from app.extensions import db
from app.models import Tenant
import logging

logger = logging.getLogger(__name__)

class TenantRepository:

    @staticmethod
    def list_all_tenant():

        return Tenant.query.all()
    
    @staticmethod
    def get(tenant_id):

        return Tenant.query.filter_by(tenant_id=tenant_id).first()
 
