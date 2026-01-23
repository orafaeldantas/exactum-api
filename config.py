
import os

class Config:
    SECRET_KEY = "dev"
    DEBUG = True

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://exactum_admin:root@localhost:5432/exactum_db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
