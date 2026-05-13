from app.extensions import db
from app.models import Goal
import logging

logger = logging.getLogger(__name__)

class GoalRepository:

    @staticmethod
    def create_goal(data, tenant_id):

        if data.get("monthly_goal"):
            goal = Goal(
                    tenant_id=tenant_id,
                    type="monthly",
                    year=9999,
                    month=9999,
                    value=data.get("monthly_goal"),
                    description="monthly"
                )

        return goal
    
    @staticmethod
    def get_goal(tenant_id):

        return Goal.query.filter_by(tenant_id=tenant_id).order_by(Goal.id.desc()).first()