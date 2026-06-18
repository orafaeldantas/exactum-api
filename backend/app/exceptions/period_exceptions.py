from app.exceptions.app_exceptions import AppException


class InvalidPeriod(AppException):
    status_code = 422

    message = "Invalid period"
