class AppException(Exception):
    status_code = 400

    message = "Application error"

    clear_auth_cookies = False

    def __init__(self, message=None, status_code=None):

        if message:
            self.message = message

        if status_code:
            self.status_code = status_code

        super().__init__(self.status_code, self.message)
