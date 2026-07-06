from database.session import DatabaseSession
from sqlalchemy import desc, select

from app.models.observability import AuditLog, PlatformEvent


class ObservabilityRepository:
    @staticmethod
    def create_log_platform(entity: PlatformEvent):
        DatabaseSession.add(entity)
        DatabaseSession.commit()

    @staticmethod
    def get_logs_platform() -> list[PlatformEvent]:
        stmt = select(PlatformEvent).order_by(desc(PlatformEvent.created_at))

        response = DatabaseSession.get_session()

        return response.scalars(stmt).all()

    @staticmethod
    def get_logs_by_tenant(tenant_id: int) -> list[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(AuditLog.tenant_id == tenant_id)
            .order_by(desc(AuditLog.created_at))
        )

        response = DatabaseSession.get_session()

        return response.scalars(stmt).all()
