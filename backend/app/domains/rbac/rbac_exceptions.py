from app.exceptions.app_exceptions import AppException


class ForbiddenException(AppException):
    status_code = 403

    message = "Forbidden - You are not authorized"


class RoleNotFound(AppException):
    status_code = 404

    message = "Role Not Found"
