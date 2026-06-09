from app.repositories.goal_repository import GoalRepository


class GoalService:
    @staticmethod
    def get_goal(tenant_id):

        return GoalRepository.get_goal(tenant_id)
