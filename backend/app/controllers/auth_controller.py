from flask import g

from app.services.auth_service import AuthService


class AuthController:
    @staticmethod
    def login(data):

        return AuthService.login(data)

    @staticmethod
    def bootstrap():

        return AuthService.bootstrap(g.user_id, g.tenant_id, g.impersonate_mode)

    @staticmethod
    def refresh_access_token():

        return AuthService.refresh_access_token()

    @staticmethod
    def logout():

        return AuthService.logout()

    @staticmethod
    def run_impersonate(tenant_id):

        return AuthService.run_impersonate(tenant_id)

    @staticmethod
    def stop_impersonate():

        return AuthService.stop_impersonate()
