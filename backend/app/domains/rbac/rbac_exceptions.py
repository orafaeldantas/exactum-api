from app.exceptions.app_exceptions import AppException


class ForbiddenException(AppException):
    status_code = 403

    message = "Forbidden - You are not authorized"
