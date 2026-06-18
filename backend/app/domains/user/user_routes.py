from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.core.security.security import owner_required, role_authorization
from app.domains.user.user_controller import UserController
from app.domains.user.user_schema import (
    CreateUserSchema,
    NewPasswordUserSchema,
    NewPassworUserResponseSchema,
    ProfileSchema,
    UpdateUserSchema,
    UserResponseSchema,
)

blp_users = Blueprint(
    "users", __name__, url_prefix="/users", description="User operations"
)


@blp_users.route("/")
class UserListRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.response(200, UserResponseSchema(many=True))
    def get(self):

        return UserController.get_users()

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(CreateUserSchema)
    @blp_users.response(201, UserResponseSchema)
    def post(self, data):

        return UserController.create_user(data)


@blp_users.route("/<int:user_id>")
class UserDetailRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.response(200, UserResponseSchema)
    def get(self, user_id):

        return UserController.get_user(user_id)

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(UpdateUserSchema)
    @blp_users.response(200, UserResponseSchema)
    def patch(self, data, user_id):

        return UserController.update_user(data, user_id)


@blp_users.route("/new_password/<int:user_id>")
class UserNewPasswordRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(NewPasswordUserSchema)
    @blp_users.response(200, NewPassworUserResponseSchema)
    def patch(self, data, user_id):

        return UserController.update_user(data, user_id)


@blp_users.route("/profile/<int:user_id>")
class UserProfileRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @owner_required()
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.response(200, ProfileSchema)
    def get(self, user_id):

        return UserController.get_user(user_id)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @owner_required()
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(ProfileSchema)
    @blp_users.response(200, ProfileSchema)
    def patch(self, data, user_id):

        return UserController.update_profile(data, user_id)
