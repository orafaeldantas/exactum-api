from typing import TYPE_CHECKING

from app.domains.goal.goal_repository import GoalRepository

if TYPE_CHECKING:
    from app.models.goals import Goal


class GoalService:
    @staticmethod
    def get_goal(tenant_id: int) -> "Goal" | None:

        goal = GoalRepository.get_goal(tenant_id)

        if not goal:
            return None

        return goal
