import json

from flask import current_app


class CacheService:
    @staticmethod
    def get(key):

        redis = current_app.extensions["redis"]

        value = redis.get(key)

        if value:
            return json.loads(value)

        return None

    @staticmethod
    def set_cache(key, value, ttl=300):
        redis = current_app.extensions["redis"]

        redis.set(key, json.dumps(value), ex=ttl)

    @staticmethod
    def delete(key_or_pattern):
        redis_client = current_app.extensions["redis"]

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
