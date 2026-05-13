from app.models import Goal
from repositories.goal_repository import UserRepository
from database.session import DatabaseSession


class goalService:

    @staticmethod
    def get_goal(tenant_id):

        return UserRepository.get_goal(tenant_id)