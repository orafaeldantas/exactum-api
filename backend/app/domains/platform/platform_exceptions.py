from app.exceptions.app_exceptions import AppException


class AuthorizationNotPermitted(AppException):
    status_code = 403

    message = "Authorization not permitted"
