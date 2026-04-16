"""
Redis Cache Service
Provides a simple key-value cache backed by Redis with an in-memory fallback.
"""

import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class RedisService:
    """Redis cache service with in-memory fallback for testing."""

    def __init__(self, redis_url: str = None):
        self._client = None
        self._memory: dict = {}
        self._ttls: dict = {}
        if redis_url:
            self._connect(redis_url)

    def _connect(self, redis_url: str) -> None:
        try:
            import redis

            self._client = redis.Redis.from_url(redis_url, decode_responses=True)
            self._client.ping()
            logger.info("Redis connected")
        except Exception as e:
            logger.warning(f"Redis unavailable, using memory store: {e}")
            self._client = None

    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set a cache value. Returns True on success."""
        try:
            if self._client:
                if ttl:
                    return bool(self._client.setex(key, ttl, str(value)))
                return bool(self._client.set(key, str(value)))
            self._memory[key] = value
            if ttl:
                self._ttls[key] = ttl
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        """Get a cached value. Returns None if not found."""
        try:
            if self._client:
                return self._client.get(key)
            return self._memory.get(key)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    def delete(self, key: str) -> bool:
        """Delete a cached value. Returns True on success."""
        try:
            if self._client:
                return bool(self._client.delete(key))
            existed = key in self._memory
            self._memory.pop(key, None)
            self._ttls.pop(key, None)
            return existed
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    def exists(self, key: str) -> bool:
        """Check if a key exists."""
        try:
            if self._client:
                return bool(self._client.exists(key))
            return key in self._memory
        except Exception:
            return False

    def flush(self) -> bool:
        """Clear all cached values."""
        try:
            if self._client:
                self._client.flushdb()
            self._memory.clear()
            self._ttls.clear()
            return True
        except Exception:
            return False
