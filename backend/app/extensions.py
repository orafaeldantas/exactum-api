from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


migrate = Migrate(directory="migrations")
jwt = JWTManager()


@jwt.invalid_token_loader
def invalid_token(reason):
    print("JWT INVALID:", reason)
    return {"error": reason}, 422


@jwt.unauthorized_loader
def missing_token(reason):
    print("JWT MISSING:", reason)
    return {"error": reason}, 401


@jwt.expired_token_loader
def expired(jwt_header, jwt_payload):
    print("JWT EXPIRED")
    return {"error": "expired"}, 401
