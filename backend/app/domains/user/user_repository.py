import logging
from collections.abc import Sequence

from sqlalchemy import select

from app.extensions import db
from app.models.user import User

logger = logging.getLogger(__name__)


class UserRepository:
    @staticmethod
    def get_all(tenant_id: int) -> Sequence[User]:
        stmt = select(User).where(User.tenant_id == tenant_id)
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_user(user_id: int) -> User | None:
        return db.session.get(User, user_id)

    @staticmethod
    def get_user_by_email(email: str) -> User | None:

        stmt = select(User).where(User.email == email, User.is_active)
        return db.session.scalars(stmt).first()
