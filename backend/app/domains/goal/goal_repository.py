import logging
from decimal import Decimal

from sqlalchemy import select

from app.extensions import db
from app.models.goals import Goal

logger = logging.getLogger(__name__)


class GoalRepository:
    @staticmethod
    def create_goal(value: Decimal, tenant_id: int) -> Goal:
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
    def get_goal(tenant_id: int) -> Goal | None:
        stmt = select(Goal).where(Goal.tenant_id == tenant_id).order_by(Goal.id.desc())

        return db.session.scalars(stmt).first()
