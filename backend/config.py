import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-fallback")
    DEBUG = os.getenv("DEBUG", "False") == "True"

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))
    )

    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))
    )

    JWT_TOKEN_LOCATION = ["cookies"]

    JWT_ACCESS_COOKIE_NAME = "access_token"
    JWT_REFRESH_COOKIE_NAME = "refresh_token"

    JWT_COOKIE_HTTPONLY = True

    JWT_COOKIE_SECURE = False
    JWT_COOKIE_SAMESITE = "Lax"

    JWT_COOKIE_CSRF_PROTECT = False

    JWT_ACCESS_COOKIE_PATH = "/"
    JWT_REFRESH_COOKIE_PATH = "/api/auth"

    # Redis
    REDIS_HOST = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

    # Swagger
    API_TITLE = "Exactum API"
    API_VERSION = "v0.1.0"
    OPENAPI_VERSION = "3.0.3"
    OPENAPI_URL_PREFIX = "/doc"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    API_SPEC_OPTIONS = {
        "components": {
            "securitySchemes": {
                "CookieAuth": {
                    "type": "apiKey",
                    "in": "cookie",
                    "name": "access_token",
                }
            }
        }
    }
