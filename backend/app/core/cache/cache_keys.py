class CacheKeys:
    @staticmethod
    def refresh_token(jti: str, tenant_id: int, user_id: int):

        return f"tenant:{tenant_id}:user:{user_id}:refresh:{jti}"

    @staticmethod
    def permissions(tenant_id: int, user_id: int):

        return f"tenant:{tenant_id}:user:{user_id}:permissions"
