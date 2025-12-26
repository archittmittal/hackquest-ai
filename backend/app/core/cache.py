"""
Redis cache manager for distributed caching and pub/sub
"""
import redis.asyncio as redis
from typing import Any, Optional
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    try:
        redis_client = await redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("✅ Redis connected successfully")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        raise

async def close_redis():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")

async def get_cache(key: str) -> Optional[Any]:
    """Get value from cache"""
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None

async def set_cache(key: str, value: Any, ttl: int = 3600):
    """Set value in cache with TTL"""
    try:
        await redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        logger.error(f"Cache set error: {e}")

async def delete_cache(key: str):
    """Delete value from cache"""
    try:
        await redis_client.delete(key)
    except Exception as e:
        logger.error(f"Cache delete error: {e}")

async def publish_message(channel: str, message: dict):
    """Publish message to Redis pub/sub channel"""
    try:
        await redis_client.publish(channel, json.dumps(message))
    except Exception as e:
        logger.error(f"Publish error: {e}")
