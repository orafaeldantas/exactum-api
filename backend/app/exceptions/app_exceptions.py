class AppException(Exception):
    status_code = 400

    message = "Application error"

    clear_auth_cookies = False

    def __init__(self, message=None):

        if message:
            self.message = message

        super().__init__(self.message)
