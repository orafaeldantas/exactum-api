from .audit_service import AuditService
from .observability_mapper import AuditMapper, PlatformMapper
from .observability_repository import ObservabilityRepository
from .platform_service import PlatformService

_repo = ObservabilityRepository()
_mapper_platform = PlatformMapper()
_mapper_audit = AuditMapper()


platform_service = PlatformService(_repo, _mapper_platform)
audit_service = AuditService(_repo, _mapper_audit)
