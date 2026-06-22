from app.exceptions.app_exceptions import AppException


class SaleNotFound(AppException):
    status_code = 404

    message = "Sale not found"


class ProductNotFound(AppException):
    status_code = 404

    message = "Product not found"
