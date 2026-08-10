from app.exceptions.app_exceptions import AppException


class ProductNotFound(AppException):
    status_code = 404

    message = "Product not found"


class ExistingProductField(AppException):
    status_code = 409

    message = "Some fields are already registered in another product"
