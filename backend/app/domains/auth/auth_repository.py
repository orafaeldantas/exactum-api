import logging

from app.extensions import db
from app.models.user import User

logger = logging.getLogger(__name__)


class AuthRepository:
    @staticmethod
    def get_user_by_id(user_id: int) -> User | None:
        return db.session.get(User, user_id)
