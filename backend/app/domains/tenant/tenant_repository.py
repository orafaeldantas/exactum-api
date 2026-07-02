import logging
from uuid import UUID

from sqlalchemy import select

from app.extensions import db
from app.models.tenant import Tenant

logger = logging.getLogger(__name__)


class TenantRepository:
    @staticmethod
    def get_tenant(tenant_id: int) -> Tenant | None:

        return db.session.get(Tenant, tenant_id)

    @staticmethod
    def get_tenant_by_uuid(tenant_uuid: UUID) -> Tenant | None:

        stmt = select(Tenant).where(Tenant.uuid == tenant_uuid)
        return db.session.scalars(stmt).first()
