from app.extensions import db
from app.models import User
import logging

logger = logging.getLogger(__name__)

class UserRepository:

    @staticmethod
    def get_all(tenant_id):

        return User.query.filter_by(tenant_id=tenant_id).all()
    
    @staticmethod
    def get(user_id):

        return User.query.filter_by(user_id=user_id).first()
 