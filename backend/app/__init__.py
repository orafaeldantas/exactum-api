import logging
import os

from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from werkzeug.middleware.proxy_fix import ProxyFix

from app.cli import register_cli
from app.core.cache.redis_client import init_redis
from app.database.tenant_filter import init_tenant_filter
from app.exceptions.handlers import register_error_handlers
from app.exceptions.jwt_handlers import register_jwt_handlers
from app.middlewares.context import init_request_context
from config import Config

from .extensions import db, jwt, migrate


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    register_cli(app)

    if config:
        app.config.update(config)
    api = Api(app)

    register_error_handlers(app)

    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    init_request_context(app)
    init_tenant_filter(db)
    init_redis(app)

    register_jwt_handlers(jwt)

    if os.getenv("FLASK_ENV") == "production":
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

    from app.core.monitoring.health_routes import blp_health
    from app.domains.auth.auth_routes import blp_auth
    from app.domains.super_admin.super_admin_routes import blp_super_admin
    from app.routes.analytics.revenue_analytics_routes import blp_revenue_analytics
    from app.routes.analytics.sold_item_analytics_routes import blp_item_analytics
    from app.routes.product_routes import blp_products
    from app.routes.sale_routes import blp_sales
    from app.routes.tenant_routes import blp_tenants
    from app.routes.user_routes import blp_users

    app.url_map.strict_slashes = False

    api.register_blueprint(blp_auth)
    api.register_blueprint(blp_users)
    api.register_blueprint(blp_tenants)
    api.register_blueprint(blp_products)
    api.register_blueprint(blp_sales)
    api.register_blueprint(blp_item_analytics)
    api.register_blueprint(blp_revenue_analytics)
    api.register_blueprint(blp_super_admin)
    api.register_blueprint(blp_health)

    return app
