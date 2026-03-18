from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, jwt
from config import Config
from app.middlewares.context import init_request_context
import logging

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
  

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    init_request_context(app)

    from app.models import product, user

    from app.routes.health import health_bp
    from app.routes.product_routes import product_bp
    from app.routes.user_routes import user_bp
    from app.routes.auth_routes import auth_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)

    return app