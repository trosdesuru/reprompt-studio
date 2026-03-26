import os
import redis
from rq import Queue

# 'redis' es el nombre del servicio en tu docker-compose.yml
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Conexión física a la base de datos Redis
conn = redis.from_url(REDIS_URL)

# La cola (pizarra) donde anotaremos los trabajos
download_queue = Queue("downloads", connection=conn)