from app.repositories.goal_repository import UserRepository


class goalService:
    @staticmethod
    def get_goal(tenant_id):

        return UserRepository.get_goal(tenant_id)
