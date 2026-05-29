import logging

from app.models.goals import Goal

logger = logging.getLogger(__name__)


class GoalRepository:
    @staticmethod
    def create_goal(value, tenant_id):

        goal = Goal(
            tenant_id=tenant_id,
            type="monthly",
            year=9999,
            month=9999,
            value=value,
            description="monthly",
        )

        return goal

    @staticmethod
    def get_goal(tenant_id):

        return (
            Goal.query.filter_by(tenant_id=tenant_id).order_by(Goal.id.desc()).first()
        )
