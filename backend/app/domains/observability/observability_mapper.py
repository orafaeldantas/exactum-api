from app.models.observability import AuditLog, PlatformEvent

from .observability_dto import AuditLogDTO, PlatformEventDTO


class PlatformMapper:
    @staticmethod
    def platform_event_to_dto(entity: PlatformEvent) -> PlatformEventDTO:
        """Converts a PlatformEvent entity into a DTO (output)."""
        return PlatformEventDTO(
            event=entity.event,
            tenant_id=entity.tenant_id,
            user_id=entity.user_id,
            payload=entity.payload,
        )

    @staticmethod
    def platform_event_from_dto(dto: PlatformEventDTO) -> PlatformEvent:
        """Converts a PlatformEventDTO into an entity (input)."""
        return PlatformEvent(
            event=dto.event,
            tenant_id=dto.tenant_id,
            user_id=dto.user_id,
            payload=dto.payload,
        )


class AuditMapper:
    @staticmethod
    def audit_log_to_dto(entity: AuditLog) -> AuditLogDTO:
        """Converts an AuditLog entity into a DTO (output).."""
        return AuditLogDTO(
            tenant_id=entity.tenant_id,
            user_id=entity.user_id,
            event=entity.event,
            entity=entity.entity,
            entity_id=entity.entity_id,
            payload=entity.payload,
        )

    @staticmethod
    def audit_log_from_dto(dto: AuditLogDTO) -> AuditLog:
        """Converts an AuditLogDTO into an entity (input)."""
        return AuditLog(
            tenant_id=dto.tenant_id,
            user_id=dto.user_id,
            event=dto.event,
            entity=dto.entity,
            entity_id=dto.entity_id,
            payload=dto.payload,
        )
