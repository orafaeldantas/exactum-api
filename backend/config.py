import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    DEBUG = True

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_REFRESH_TOKEN_EXPIRES = False #timedelta(minutes=30)
    JWT_ACCESS_TOKEN_EXPIRES = False
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    JWT_COOKIE_CSRF_PROTECT = False

    
