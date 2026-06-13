# exceptions/jwt_handlers.py

from flask import jsonify
from flask_jwt_extended import unset_jwt_cookies


def auth_error_response(message: str, status_code: int):
    response = jsonify({"error": message})

    unset_jwt_cookies(response)

    return response, status_code


def register_jwt_handlers(jwt):

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return auth_error_response("invalid_token", 422)

    @jwt.expired_token_loader
    def expired(jwt_header, jwt_payload):
        return auth_error_response("expired", 401)

    @jwt.revoked_token_loader
    def revoked(jwt_header, jwt_payload):
        return auth_error_response("revoked", 401)

    @jwt.unauthorized_loader
    def missing_token(reason):
        return {"error": "missing_token"}, 401
