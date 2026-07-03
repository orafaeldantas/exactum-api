from app.exceptions.app_exceptions import AppException


class AuthorizationNotPermitted(AppException):
    status_code = 403

    message = "Authorization not permitted"


class ResourceNotFound(AppException):
    status_code = 404

    message = "Resource not found"
