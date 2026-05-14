from app.models import User
from repositories.user_repository import UserRepository
from database.session import DatabaseSession

from exceptions.user_exceptions import UserNotFound


class UserService:

    @staticmethod
    def list_users(tenant_id):

        return UserRepository.get_all(tenant_id)

    @staticmethod
    def create_user(data, tenant_id):

        user = User(
            username=data.get("username"),
            tenant_id=tenant_id,
            is_active=data.get("is_active"),
            role=data.get("role", "user"),
            email=data.get("email"),
            password_reset=True
        )

        user.set_password(data.get("password"))

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user
    
    @staticmethod
    def get_user(user_id):

        return UserRepository.get(user_id)
    
    @staticmethod
    def update_user(data, user_id):

        user = UserRepository.get(user_id)

        if not user:
            raise UserNotFound()
        
        if data.get("password") and (data.get("password_reset") == True):

            user.set_password(data["password"])

        update_fields = [
            "username",
            "email",
            "role",
            "is_active",
            "password_reset"
        ]

        for field in update_fields:

            if field in data:

                setattr(user, field, data[field])
        
        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user
    
    @staticmethod
    def update_profile(data, user_id):
        
        user = UserRepository.get(user_id)

        if data.get("currentPassword"):

            if not user.check_password(data["currentPassword"]):
                raise   
            
            if data.get("password") != data.get("confirmPassword"):
                raise
        
        user.set_password(data["password"])

        update_fields = [
            "username",
            "email",
        ]

        for field in update_fields:

            if field in data:

                setattr(user, field, data[field])

        DatabaseSession.add(user)
        DatabaseSession.commit()

        return user

        
        

