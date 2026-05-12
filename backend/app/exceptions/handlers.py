from flask import jsonify

from exceptions.app_exceptions import AppException


def register_error_handlers(app):

    @app.errorhandler(AppException)
    def handle_app_exception(error):

        return jsonify({
            "error": error.message
        }), error.status_code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):

        return jsonify({
            "error": "Internal server error"
        }), 500