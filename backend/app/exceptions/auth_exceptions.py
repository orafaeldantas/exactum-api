from exceptions.app_exceptions import AppException

class InvalidCredentials(AppException):
    
    status_code = 401 

    message = "Invalid credentials"

class InvalidInputEmail(AppException):

    status_code = 400

    message = "Invalid input - Email is required"

class BootstrapNotFound(AppException):

    status_code = 404

    message = "Bootstrap data not found"