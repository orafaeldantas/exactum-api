from flask import Response, jsonify
from flask_jwt_extended import (
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from app.domains.auth.auth_dto import SessionTokens


class AuthResponse:
    @staticmethod
    def success(
        message: str,
        tokens: SessionTokens,
    ) -> Response:

        response = jsonify({"message": message})

        set_access_cookies(
            response,
            tokens.access_token,
        )

        set_refresh_cookies(
            response,
            tokens.refresh_token,
        )

        return response

    @staticmethod
    def logout(message: str):

        response = jsonify({"message": message})

        unset_jwt_cookies(response)

        return response
