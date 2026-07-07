from .audit_service import AuditService
from .observability_mapper import PlatformMapper
from .observability_repository import ObservabilityRepository
from .platform_service import PlatformService

_repo = ObservabilityRepository()
_mapper = PlatformMapper()


platform_service = PlatformService(_repo, _mapper)
audit_service = AuditService(_repo, _mapper)
