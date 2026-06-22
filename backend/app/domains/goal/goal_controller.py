from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.goals import Goal


class TenantController:
    @staticmethod
    def create_tenant(data: dict) -> "Goal" | None:

        return None
