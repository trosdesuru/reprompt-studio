import os
import redis
from dotenv import load_dotenv

load_dotenv(override=False)


def get_redis_connection():
    url = os.getenv("REDIS_URL")

    if not url:
        host = os.getenv("REDIS_HOST", "127.0.0.1")
        port = os.getenv("REDIS_PORT", "6379")
        url = f"redis://{host}:{port}/0"

    print(f"📡 [REDIS-DEBUG] Intentando conexión a: {url}")

    return redis.from_url(
        url, decode_responses=True, socket_timeout=5, socket_connect_timeout=5
    )


conn = get_redis_connection()
