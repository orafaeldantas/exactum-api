from app.services.goal_service import GoalService


class TenantController:
    @staticmethod
    def create_tenant(data):

        return GoalService.get_goal(data)
