from flask import Flask
from .extensions import db, migrate, jwt
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    #db.init_app(app)
    #migrate.init_app(app, db)
    #jwt.init_app(app)

    from .routes.health import health_bp
    app.register_blueprint(health_bp)

    return app