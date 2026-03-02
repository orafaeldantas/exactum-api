from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required

db = SQLAlchemy()
migrate = Migrate(directory="migrations")
jwt = JWTManager()


@jwt.user_identity_loader
def user_identity_lookup(user):

    return user.id

@jwt.additional_claims_loader
def add_claims_to_access_token(user):

    return {
        "is_admin": getattr(user, 'is_admin', False)
    }