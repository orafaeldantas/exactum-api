import json

from app.core.config.settings import Settings


class InitCache:
    redis_client = None

    @classmethod
    def init_app(cls, redis):
        cls.redis_client = redis


class CacheService(InitCache):
    def get(self, key):

        value = self.redis_client.get(key)

        if value:
            return json.loads(value)

        return None

    def set_cache(self, key, value, ttl=None):
        # Default cache expiration aligned with JWT refresh token TTL
        if ttl is None:
            ttl = Settings.refresh_token_ttl()
        self.redis_client.set(key, json.dumps(value), ex=ttl)

    def delete(self, key_or_pattern):
        redis_client = self.redis_client

        if "*" in key_or_pattern:
            batch_size = 5000
            keys_to_delete = []
            pipe = redis_client.pipeline(transaction=False)

            for key in redis_client.scan_iter(match=key_or_pattern, count=1000):
                keys_to_delete.append(key)
                if len(keys_to_delete) >= batch_size:
                    pipe.unlink(*keys_to_delete)
                    pipe.execute()
                    keys_to_delete = []

            if keys_to_delete:
                pipe.unlink(*keys_to_delete)
                pipe.execute()
        else:
            redis_client.unlink(key_or_pattern)
