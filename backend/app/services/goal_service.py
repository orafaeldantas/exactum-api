from app.models import Goal
from app.repositories.goal_repository import UserRepository
from app.database.session import DatabaseSession


class goalService:

    @staticmethod
    def get_goal(tenant_id):

        return UserRepository.get_goal(tenant_id)