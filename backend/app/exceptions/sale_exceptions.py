from exceptions.app_exceptions import AppException


class SaleNotFound(AppException):

    status_code = 404

    message = "Sale not found"