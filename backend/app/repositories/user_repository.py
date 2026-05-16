from app.extensions import db
from app.models import User
import logging

logger = logging.getLogger(__name__)

class UserRepository:

    @staticmethod
    def get_all(tenant_id):

        return User.query.filter_by(tenant_id=tenant_id).all()
    
    @staticmethod
    def get_user(user_id):

        return User.query.filter_by(id=user_id).first()
    
    @staticmethod
    def get_user_by_email(email):

        return User.query.filter_by(email=email, is_active=True).first()
    
    

 