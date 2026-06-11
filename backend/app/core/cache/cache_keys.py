class CacheKeys:
    @staticmethod
    def refresh_token(jti: str, user_id: int):

        return f"user:{user_id}:refresh:{jti}"
