import os
import redis

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

COOKIE_PARAMS = {
    "httponly": True,
    "path": "/",
    "secure": IS_PRODUCTION,
    "samesite": "lax",
    "domain": (
        ".reprompt.studio"
        if IS_PRODUCTION or "reprompt.studio" in os.getenv("FRONTEND_URL", "")
        else None
    ),
}

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)
