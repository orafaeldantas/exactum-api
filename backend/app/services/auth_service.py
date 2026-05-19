from app.models import User
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.goal_repository import GoalRepository 

from app.services.token_service import TokenService

from app.exceptions.auth_exceptions import(
    InvalidCredentials, InvalidInputEmail, 
    BootstrapNotFound
) 


class AuthService:

    @staticmethod
    def login(data):

        if not data.get("email"):
            raise InvalidInputEmail()

        email = data.get("email")
        user = UserRepository.get_user_by_email(email)

        if not user:

            raise InvalidCredentials()       

        if not user.check_password(data.get("password")):

            raise InvalidCredentials()
        

        access_token = TokenService.generate_access_token(user)
    
        return {"access_token": access_token}
    
    @staticmethod
    def bootstrap(user_id, tenant_id):

        user = UserRepository.get_user(user_id)     
        tenant = TenantRepository.get_tenant(tenant_id)
        goal = GoalRepository.get_goal(tenant_id)
    

        if not (user and tenant):
            raise BootstrapNotFound()
        
        
        auth = {
            "user_id": user.id,
            "tenant_id": tenant.id,
            "role": user.role,
            "password_reset": user.password_reset
        }
        
        tenant_formated = {
            "name": tenant.name,
            "corporate_email": tenant.corporate_email,
            "global_min_stock": tenant.global_min_stock,
            "goal": goal.value if goal else 0
        }

        bootstrap_data = {
            "user": user,
            "tenant": tenant_formated,
            "goal": goal,
            "auth": auth
        }      

        return bootstrap_data
    