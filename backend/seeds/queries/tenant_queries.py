from sqlalchemy import select

from app.extensions import db
from app.models.user import User


class TenantQueries:
    @staticmethod
    def get_users_by_tenant(tenant_id: int) -> int | None:

        stmt = select(User).filter_by(tenant_id=tenant_id, role="admin")

        user = db.session.scalars(stmt).first()

        if user is None:
            return None

        return user.id
