import logging

from app.models.tenant import Tenant

logger = logging.getLogger(__name__)


class TenantRepository:
    @staticmethod
    def get_tenant(tenant_id):

        return Tenant.query.filter_by(id=tenant_id).first()
