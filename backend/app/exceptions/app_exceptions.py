
class AppException(Exception):

    status_code = 400

    message = "Application error"

    def __init__(self, message=None):

        if message:
            self.message = message

        super().__init__(self.message)