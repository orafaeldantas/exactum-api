from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.controllers.auth_controller import AuthController
from app.schemas.auth_schema import (
    LoginSchema,
    LogoutResponseSchema,
    RefreshResponseSchema,
    ResponseBootstrapSchema,
    ResponseLoginSchema,
    RunImpersonateResponseSchema,
    StopImpersonateResponseSchema,
)
from app.security import role_authorization

blp_auth = Blueprint(
    "auth", __name__, url_prefix="/auth", description="Authentication operations"
)


@blp_auth.route("/login")
class LoginRoute(MethodView):
    @blp_auth.doc(
        description="""
        Authentication is performed via HttpOnly cookies.

        On success, the API sets:

        - access_token (HttpOnly)
        - refresh_token (HttpOnly)

        Tokens are not returned in the response body.
        """
    )
    @blp_auth.arguments(LoginSchema)
    @blp_auth.response(200, ResponseLoginSchema)
    def post(self, data):

        return AuthController.login(data)


@blp_auth.route("/bootstrap")
class BootstrapRoute(MethodView):
    @jwt_required()
    @blp_auth.doc(security=[{"CookieAuth": []}])
    @blp_auth.response(200, ResponseBootstrapSchema)
    def get(self):

        return AuthController.bootstrap()


@blp_auth.route("/refresh")
class Refresh(MethodView):
    @jwt_required(refresh=True)
    @blp_auth.doc(security=[{"CookieAuth": []}])
    @blp_auth.response(200, RefreshResponseSchema)
    def post(self):

        return AuthController.refresh_access_token()


@blp_auth.route("/logout")
class Logout(MethodView):
    @jwt_required(refresh=True)
    @blp_auth.doc(security=[{"CookieAuth": []}])
    @blp_auth.response(200, LogoutResponseSchema)
    def post(self):

        return AuthController.logout()


@blp_auth.route("/run-impersonate/<int:tenant_id>")
class RunImpersonateRoute(MethodView):
    @jwt_required()
    @role_authorization(["super-admin"])
    @blp_auth.doc(security=[{"CookieAuth": []}])
    @blp_auth.response(201, RunImpersonateResponseSchema)
    def post(self, tenant_id):

        return AuthController.run_impersonate(tenant_id)


@blp_auth.route("/stop-impersonate")
class StopImpersonateRoute(MethodView):
    @jwt_required(refresh=True)
    @role_authorization(["super-admin", "admin"])
    @blp_auth.doc(security=[{"CookieAuth": []}])
    @blp_auth.response(201, StopImpersonateResponseSchema)
    def post(self):

        return AuthController.stop_impersonate()
