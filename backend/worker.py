import logging
from rq import Worker, Queue
from app.core.redis_config import conn

# Logs para el proceso worker
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("rq_worker")

if __name__ == '__main__':
    try:
        # Definimos la cola 'downloads' usando nuestra conexión de Redis
        queue = Queue('downloads', connection=conn)
        worker = Worker([queue], connection=conn)
        
        logger.info("👷 Worker RQ v2.7.0 online. Esperando tareas en 'downloads'...")
        worker.work()
    except Exception as e:
        logger.error(f"❌ El Worker ha muerto: {e}")