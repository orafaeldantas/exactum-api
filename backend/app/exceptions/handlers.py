from flask import jsonify

from app.exceptions.app_exceptions import AppException


import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):

    @app.errorhandler(AppException)
    def handle_app_exception(error):

        return jsonify({
            "error": error.message
        }), error.status_code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):

        logger.exception(error)

        return jsonify({
            "error": "Internal server error"
        }), 500