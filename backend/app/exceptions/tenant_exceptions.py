from app.exceptions.app_exceptions import AppException


class RegistrationFailed(AppException):
    status_code = 400

    message = "Could not complete registration"


class TenantNotFound(AppException):
    status_code = 404

    message = "Tenant not found"
