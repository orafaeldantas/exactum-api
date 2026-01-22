from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
jwt_auth = jwt_required()