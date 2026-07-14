from .observability_dto import AuditLogDTO
from .observability_mapper import AuditMapper
from .observability_repository import ObservabilityRepository


class AuditService:
    def __init__(self, repo: ObservabilityRepository, mapper: AuditMapper):
        self.repo = repo
        self.mapper = mapper

    def create_log(self, dto: AuditLogDTO) -> None:
        entity = self.mapper.audit_log_from_dto(dto)

        self.repo.create_audit_logs(entity)

    def get_logs(self, tenant_id: int) -> AuditLogDTO:

        logs = self.repo.get_logs_by_tenant(tenant_id)

        return [self.mapper.audit_log_to_dto(log) for log in logs]
