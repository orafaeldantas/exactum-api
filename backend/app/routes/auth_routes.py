from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from schemas.auth_schema import (
    LoginSchema, ResponseLoginSchema,
    ResponseBootstrapSchema
)

from controllers.auth_controller import AuthController

from app.security import owner_required, role_authorization


blp_auth = Blueprint(
    "auth",
    __name__,
    url_prefix="/auth",
    description="Authentication operations"
)


@blp_auth.route("/login")
class LoginRoute(MethodView):

    @blp_auth.arguments(LoginSchema)
    @blp_auth.response(200, ResponseLoginSchema)
    def post(self, data):
        
        return AuthController.login()
    
@blp_auth.route("/bootstrap")
@jwt_required()
class BootstrapRoute(MethodView):

    @blp_auth.response(200, ResponseBootstrapSchema)
    def get(self):

        return AuthController.bootstrap()