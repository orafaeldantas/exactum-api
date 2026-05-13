from app.models import User
from repositories.user_repository import UserRepository
from repositories.tenant_repository import TenantRepository
from repositories.goal_repository import GoalRepository 

from services.token_service import TokenService

from exceptions.auth_exceptions import(
    InvalidCredentials, InvalidInputEmail, 
    BootstrapNotFound
) 


class UserService:

    @staticmethod
    def login(data):

        if not data.get("email"):
            raise InvalidInputEmail()

        email = data.get("email")
        user = UserRepository.get_user_by_email(email)

        if not user:
            raise InvalidCredentials()
        
        if user.check_password_hash(data.get("password")):
            raise InvalidCredentials()

        access_token = TokenService.generate_access_token(user)
    
        return access_token
    
    @staticmethod
    def bootstrap(user_id, tenant_id):

        user = UserRepository.get(user_id)     
        tenant = TenantRepository.get(tenant_id)
        goal = GoalRepository.get_goal(tenant_id)

        if not (user and tenant and goal):
            raise BootstrapNotFound()

        bootstrap_data = {
            user: user,
            tenant: tenant,
            goal: goal,
        }

        return bootstrap_data
    