from flask import g
from app.services.user_service import UserService


class UserController:

    @staticmethod
    def get_users():

        return UserService.list_users(g.tenant_id)

    @staticmethod
    def create_user(data):

        return UserService.create_user(data, g.tenant_id)
    
    @staticmethod
    def get_user(user_id): 
         
         return UserService.get_user(user_id)
    
    @staticmethod
    def update_user(data, user_id):
        
        return UserService.update_user(data, user_id)
    
    @staticmethod
    def update_profile(data, user_id):
        
        return UserService.update_profile(data, user_id)