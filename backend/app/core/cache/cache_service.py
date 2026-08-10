from __future__ import annotations

import json
from typing import TYPE_CHECKING, Any

from app.core.config.settings import Settings

if TYPE_CHECKING:
    from app.extensions import Redis


class InitCache:
    redis_client: Redis | None = None

    @classmethod
    def init_app(cls, redis: Redis):
        cls.redis_client = redis


class CacheService(InitCache):
    def get(self, key: str) -> Any:

        if self.redis_client is None:
            raise RuntimeError(
                "CacheService not initialized. Call InitCache.init_app(redis) first."
            )

        value = self.redis_client.get(key)

        if value:
            return json.loads(value)

        return None

    def set_cache(
        self, key: str, value="data to validate", ttl: int | None = None
    ) -> None:
        if self.redis_client is None:
            raise RuntimeError(
                "CacheService not initialized. Call InitCache.init_app(redis) first."
            )
        # Default cache expiration aligned with JWT refresh token TTL
        if ttl is None:
            ttl = Settings.refresh_token_ttl()
        self.redis_client.set(key, json.dumps(value), ex=ttl)

    def delete(self, key_or_pattern: str) -> None:
        if self.redis_client is None:
            raise RuntimeError(
                "CacheService not initialized. Call InitCache.init_app(redis) first."
            )
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
