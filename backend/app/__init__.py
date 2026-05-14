from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, jwt
from config import Config
from app.middlewares.context import init_request_context
from app.database.tenant_filter import init_tenant_filter
import logging

from flask_smorest import Api

from exceptions.handlers import register_error_handlers


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    api = Api(app)
    
    register_error_handlers(app)
  
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
    init_tenant_filter(db)
    

    from app.models import product, user

    from routes.user_routes import blp_user
    from routes.tenant_routes import blp_tenants
    from routes.product_routes import blp_products
    from routes.sale_routes import blp_sales
    from routes.analytics.item_analytics_routes import blp_item_analytics
    from routes.analytics.revenue_analytics_routes import blp_revenue_analytics
    from routes.super_admin_routes import blp_super_admin


    api.register_blueprint(blp_user)
    api.register_blueprint(blp_tenants)
    api.register_blueprint(blp_products)
    api.register_blueprint(blp_sales)
    api.register_blueprint(blp_item_analytics)
    api.register_blueprint(blp_revenue_analytics)
    api.register_blueprint(blp_super_admin)
    

    return app