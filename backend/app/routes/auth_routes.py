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
)

blp_auth = Blueprint(
    "auth", __name__, url_prefix="/auth", description="Authentication operations"
)


@blp_auth.route("/login")
class LoginRoute(MethodView):
    @blp_auth.arguments(LoginSchema)
    @blp_auth.response(200, ResponseLoginSchema)
    def post(self, data):

        return AuthController.login(data)


@blp_auth.route("/bootstrap")
class BootstrapRoute(MethodView):
    @jwt_required()
    @blp_auth.doc(security=[{"BearerAuth": []}])
    @blp_auth.response(200, ResponseBootstrapSchema)
    def get(self):

        return AuthController.bootstrap()


@blp_auth.route("/refresh")
class Refresh(MethodView):
    @jwt_required(refresh=True)
    @blp_auth.doc(security=[{"BearerAuth": []}])
    @blp_auth.response(200, RefreshResponseSchema)
    def post(self):

        return AuthController.refresh_access_token()


@blp_auth.route("/logout")
class Logout(MethodView):
    @jwt_required(refresh=True)
    @blp_auth.doc(security=[{"BearerAuth": []}])
    @blp_auth.response(200, LogoutResponseSchema)
    def post(self):

        return AuthController.logout()
