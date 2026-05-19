from app.extensions import db
from app.models import Tenant
import logging

logger = logging.getLogger(__name__)

class TenantRepository:
 
    @staticmethod
    def get_tenant(tenant_id):

        return Tenant.query.filter_by(id=tenant_id).first()
 
