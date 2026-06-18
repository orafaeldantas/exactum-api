from flask import current_app


class Settings:
    @staticmethod
    def refresh_token_ttl() -> int:
        return int(current_app.config["JWT_REFRESH_TOKEN_EXPIRES"].total_seconds())
