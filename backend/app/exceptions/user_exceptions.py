from app.exceptions.app_exceptions import AppException


class UserNotFound(AppException):

    status_code = 404

    message = "User not found"

class PasswordMismatchException(AppException):

    status_code = 400

    message = "The passwords don't match"

class InvalidPasswordException(AppException):

    status_code = 401

    message = "Invalid password"
