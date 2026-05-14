from exceptions.app_exceptions import AppException

class ProductNotFound(AppException):

    status_code = 404

    message = "Product not found"