from app.models.observability import AuditLog, PlatformEvent

from .observability_dto import AuditLogDTO, PlatformEventDTO


class PlatformMapper:
    @staticmethod
    def platform_event_to_dto(entity: PlatformEvent) -> PlatformEventDTO:
        """Converts a PlatformEvent entity into a DTO (output)."""
        return PlatformEventDTO(
            event=entity.event,
            tenant_id=entity.tenant_id,
            tenant_uuid=entity.tenant_uuid,
            user_id=entity.user_id,
            user_uuid=entity.user_uuid,
            payload=entity.payload,
            created_at=entity.created_at,
        )

    @staticmethod
    def platform_event_from_dto(dto: PlatformEventDTO) -> PlatformEvent:
        """Converts a PlatformEventDTO into an entity (input)."""
        return PlatformEvent(
            event=dto.event,
            tenant_id=dto.tenant_id,
            tenant_uuid=dto.tenant_uuid,
            user_id=dto.user_id,
            user_uuid=dto.user_uuid,
            payload=dto.payload,
        )


class AuditMapper:
    @staticmethod
    def audit_log_to_dto(entity: AuditLog) -> AuditLogDTO:
        """Converts an AuditLog entity into a DTO (output).."""
        return AuditLogDTO(
            tenant_id=entity.tenant_id,
            tenant_uuid=entity.tenant_uuid,
            user_id=entity.user_id,
            user_uuid=entity.user_uuid,
            event=entity.event,
            entity=entity.entity,
            payload=entity.payload,
            created_at=entity.created_at,
        )

    @staticmethod
    def audit_log_from_dto(dto: AuditLogDTO) -> AuditLog:
        """Converts an AuditLogDTO into an entity (input)."""
        return AuditLog(
            tenant_id=dto.tenant_id,
            tenant_uuid=dto.tenant_uuid,
            user_id=dto.user_id,
            user_uuid=dto.user_uuid,
            event=dto.event,
            entity=dto.entity,
            payload=dto.payload,
        )
