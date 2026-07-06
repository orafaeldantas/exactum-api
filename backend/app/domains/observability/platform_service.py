from .observability_dto import PlatformEventDTO
from .observability_mapper import PlatformMapper
from .observability_repository import ObservabilityRepository


class PlatformService:
    def __init__(self, repo: ObservabilityRepository, mapper: PlatformMapper):
        self.repo = repo
        self.mapper = mapper

    def create_log(self, dto: PlatformEventDTO) -> None:
        entity = self.mapper.platform_event_from_dto(dto)

        self.repo.create_log_platform(entity)

    def get_logs(self) -> PlatformEventDTO:

        logs = self.repo.get_logs_platform()

        return self.mapper.platform_event_to_dto(logs)
