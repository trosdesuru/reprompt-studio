import os

import redis
from rq import Queue

# 'redis' es el nombre del servicio en docker-compose
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

conn = redis.from_url(REDIS_URL)
# Esta es la cola que tu ruta está intentando importar
download_queue = Queue("downloads", connection=conn)