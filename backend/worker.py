import logging
from rq import Queue, Worker
from app.core.redis_config import conn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("rq_worker")

if __name__ == "__main__":
    try:
        premium_queue = Queue("downloads_premium", connection=conn)
        free_queue = Queue("downloads_free", connection=conn)

        # El orden de la lista importa:
        # vaciará premium antes de tocar free
        worker = Worker([premium_queue, free_queue], connection=conn)

        logger.info("👷 Worker RQ v2.7.0 online.")
        logger.info("🎧 Escuchando colas: 1. downloads_premium | 2. downloads_free")
        worker.work()
    except Exception as e:
        logger.error(f"❌ El Worker ha muerto: {e}")
