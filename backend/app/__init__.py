from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, jwt
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.models import product, user

    from app.routes.health import health_bp
    from app.routes.product_routes import product_bp
    from app.routes.auth_routes import auth_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(auth_bp)

    return app