import logging
import os

from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from werkzeug.middleware.proxy_fix import ProxyFix

from app.cli import register_cli
from app.core.cache.cache_service import InitCache
from app.core.middlewares.context import init_request_context
from app.database.tenant_filter import init_tenant_filter
from app.exceptions.handlers import register_error_handlers
from app.exceptions.jwt_handlers import register_jwt_handlers
from app.extensions import db, init_redis, jwt, migrate
from app.infra.observability.request_logger.config import (
    setup_request_logger,
)
from app.infra.observability.request_logger.logger import (
    init_request_logger,
)
from config import Config


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

    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
    if not ALLOWED_ORIGINS:
        raise RuntimeError(
            "CRITICAL ERROR: Variable 'ALLOWED_ORIGINS' "
            "not configured in the environment!"
        )

    CORS(
        app,
        resources={
            r"/*": {
                "origins": ALLOWED_ORIGINS,
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                "expose_headers": [],
                "max_age": 600,
            }
        },
        supports_credentials=True,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    init_request_context(app)
    init_request_logger(app)
    init_tenant_filter(db)

    init_redis(app)
    InitCache.init_app(app.extensions["redis"])

    setup_request_logger()

    register_jwt_handlers(jwt)

    # x_for2 -> necessary to get the real IP,
    # since there are two layers of proxies: Cloudflare and Nginx.
    if os.getenv("FLASK_ENV") == "production":
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1, x_port=1)

    from app.core.monitoring.health_routes import blp_health
    from app.domains.auth.auth_routes import blp_auth
    from app.domains.platform.platform_routes import blp_platform
    from app.domains.product.product_routes import blp_products
    from app.domains.rbac.rbac_routes import blp_rbac
    from app.domains.sale.routes.revenue_analytics_routes import blp_revenue_analytics
    from app.domains.sale.routes.sale_routes import blp_sales
    from app.domains.sale.routes.sold_item_analytics_routes import blp_item_analytics
    from app.domains.tenant.tenant_routes import blp_tenants
    from app.domains.user.user_routes import blp_users

    app.url_map.strict_slashes = False

    api.register_blueprint(blp_auth)
    api.register_blueprint(blp_users)
    api.register_blueprint(blp_tenants)
    api.register_blueprint(blp_products)
    api.register_blueprint(blp_sales)
    api.register_blueprint(blp_item_analytics)
    api.register_blueprint(blp_revenue_analytics)
    api.register_blueprint(blp_platform)
    api.register_blueprint(blp_health)
    api.register_blueprint(blp_rbac)

    return app
