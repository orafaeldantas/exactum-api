from flask.views import MethodView
from flask_smorest import Blueprint
from flask_jwt_extended import jwt_required

from app.schemas.user_schema import (
    UserResponseSchema, CreateUserSchema, UpdateUserSchema,
    ProfileSchema
)

from app.controllers.user_controller import UserController

from app.security import owner_required, role_authorization


blp_users = Blueprint(
    "users",
    __name__,
    url_prefix="/users",
    description="User operations"
)


@blp_users.route("/")
class UserListRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"BearerAuth": []}])
    @blp_users.response(200, UserResponseSchema(many=True))
    def get(self):

        return UserController.get_users()


    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"BearerAuth": []}])
    @blp_users.arguments(CreateUserSchema)
    @blp_users.response(201, UserResponseSchema)
    def post(self, data):

        return UserController.create_user(data)


@blp_users.route("/<int:user_id>")
class UserDetailRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"BearerAuth": []}])
    @blp_users.response(200, UserResponseSchema)
    def get(self, user_id):

        return UserController.get_user(user_id)
    
    
    @jwt_required()
    @role_authorization(["admin", "super-admin"])
    @blp_users.doc(security=[{"BearerAuth": []}])
    @blp_users.arguments(UpdateUserSchema)
    @blp_users.response(200, UserResponseSchema)
    def patch(self, data, user_id ):
        
        return UserController.update_user(data, user_id)
    
@blp_users.route("/profile/<int:user_id>")
class UserProfileRoute(MethodView):

    @jwt_required()
    @role_authorization(["admin", "super-admin", "user"])
    @owner_required()
    @blp_users.doc(security=[{"BearerAuth": []}])
    @blp_users.response(200, ProfileSchema)
    def get(self, user_id):

        return UserController.get_user(user_id)
    

    @jwt_required()  
    @role_authorization(["admin", "super-admin", "user"])
    @owner_required()
    @blp_users.doc(security=[{"BearerAuth": []}])
    @blp_users.arguments(ProfileSchema)
    @blp_users.response(200, ProfileSchema)
    def patch(self, data, user_id ):
        
        return UserController.update_profile(data, user_id)
        