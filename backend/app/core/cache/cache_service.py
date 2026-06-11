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

    def set(key, value, ttl=300):
        redis = current_app.extensions["redis"]

        redis.set(key, json.dumps(value), ex=ttl)

    @staticmethod
    def delete(key):

        redis = current_app.extensions["redis"]

        redis.delete(key)
