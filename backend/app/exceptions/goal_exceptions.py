from app.exceptions.app_exceptions import AppException

class RegistrationFailedGoal(AppException):
    
    status_code = 500

    message = "An unexpected error occurred while creating the goal"