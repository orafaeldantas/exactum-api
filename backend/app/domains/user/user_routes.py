from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

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

if TYPE_CHECKING:
    from app.models.user import User

blp_users = Blueprint(
    "users", __name__, url_prefix="/users", description="User operations"
)


@blp_users.route("/")
class UserListRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.response(200, UserResponseSchema(many=True))
    def get(self) -> Sequence["User"]:

        return UserController.get_users()

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(CreateUserSchema)
    @blp_users.response(201, UserResponseSchema)
    def post(self, data: dict) -> "User":

        return UserController.create_user(data)


@blp_users.route("/<uuid:user_uuid>")
class UserDetailRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.response(200, UserResponseSchema)
    def get(self, user_uuid: UUID) -> "User":

        return UserController.get_user(user_uuid)

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(UpdateUserSchema)
    @blp_users.response(200, UserResponseSchema)
    def patch(self, data: dict, user_uuid: UUID) -> "User":

        return UserController.update_user(data, user_uuid)


@blp_users.route("/new_password/<uuid:user_uuid>")
class UserNewPasswordRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(NewPasswordUserSchema)
    @blp_users.response(200, NewPassworUserResponseSchema)
    def patch(self, data: dict, user_uuid: UUID) -> "User":

        return UserController.update_user(data, user_uuid)


@blp_users.route("/profile/<uuid:user_uuid>")
class UserProfileRoute(MethodView):
    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @owner_required()
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.response(200, ProfileSchema)
    def get(self, user_uuid: UUID) -> "User":

        return UserController.get_user(user_uuid)

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @owner_required()
    @blp_users.doc(security=[{"CookieAuth": []}])
    @blp_users.arguments(ProfileSchema)
    @blp_users.response(200, ProfileSchema)
    def patch(self, data: dict, user_uuid: UUID) -> "User":

        return UserController.update_profile(data, user_uuid)
