from app.exceptions.app_exceptions import AppException


class InvalidCredentials(AppException):
    status_code = 401

    message = "Invalid credentials"


class InvalidInputEmail(AppException):
    status_code = 400

    message = "Invalid input - Email is required"


class BootstrapNotFound(AppException):
    status_code = 404

    message = "Bootstrap data not found"


class RefreshTokenRevoked(AppException):
    status_code = 401

    message = "Refresh token revoked"

    clear_auth_cookies = True


class UnauthorizedUser(AppException):
    status_code = 401

    message = "User not found"

    clear_auth_cookies = True


class AdminNotFound(AppException):
    status_code = 404

    message = "Admin not found"


class UserNotFound(AppException):
    status_code = 404

    message = "User not found"
