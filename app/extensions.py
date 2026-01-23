from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, create_access_token

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
jwt_auth = jwt_required()
jwt_token = create_access_token