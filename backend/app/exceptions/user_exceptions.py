from exceptions.app_exceptions import AppException


class UserNotFound(AppException):

    status_code = 404

    message = "User not found"