from flask import g
from app.services.auth_service import AuthService



class AuthController:

    @staticmethod
    def login(data):

        return AuthService.login(data)
    
    @staticmethod
    def bootstrap():

        return AuthService.bootstrap(g.user_id, g.tenant_id)

