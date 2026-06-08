import logging

from app.extensions import db
from app.models.tenant import Tenant

logger = logging.getLogger(__name__)


class TenantRepository:
    @staticmethod
    def get_tenant(tenant_id: int) -> Tenant | None:

        return db.session.get(Tenant, tenant_id)
