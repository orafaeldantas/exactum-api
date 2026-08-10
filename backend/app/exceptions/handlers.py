import logging

from flask import jsonify
from flask_jwt_extended import unset_jwt_cookies

from app.exceptions.app_exceptions import AppException

logger = logging.getLogger(__name__)


def register_error_handlers(app):

    @app.errorhandler(AppException)
    def handle_app_exception(error):

        response = jsonify({"error": error.message})

        if error.clear_auth_cookies:
            unset_jwt_cookies(response)

        return response, error.status_code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):

        logger.exception(error)

        return jsonify({"error": "Internal server error"}), 500
