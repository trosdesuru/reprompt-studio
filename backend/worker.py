import logging
import time

from rq import Queue, Worker

from sqlmodel import Session, select

from app.models.user import User
from app.models.directory import Directory
from app.models.prompt import ImagePrompt

from app.core.db import engine
from app.core.redis_config import conn

from app.services.embedding_service import EmbeddingService

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("rq_worker")


def process_image_ai(prompt_id: str):
    with Session(engine) as session:
        prompt = session.get(ImagePrompt, prompt_id)
        if not prompt:
            logger.error(f"❌ [WORKER] Prompt {prompt_id} no encontrado en DB.")
            return

        try:
            logger.info(f"🧠 [WORKER] Iniciando procesamiento de IA para: {prompt_id}")
            texto_a_vectorizar = prompt.prompt or prompt.title or "Generative Art"
            vector = EmbeddingService.generate_vector(prompt.prompt or "Generative Art")

            start_time = time.time()
            prompt.embedding = vector
            end_time = time.time()

            tiempo_ia = round(end_time - start_time, 2)

            session.add(prompt)
            session.commit()
            logger.info(f"✅ [WORKER] IA completada con éxito para ID: {prompt_id}")

        except Exception as e:
            logger.error(
                f"❌ [WORKER] Fallo crítico procesando IA en ID {prompt_id}: {e}"
            )


if __name__ == "__main__":
    try:
        queues = [
            Queue("default", connection=conn),
            Queue("downloads_premium", connection=conn),
            Queue("downloads_free", connection=conn),
        ]

        worker = Worker(queues, connection=conn)
        logger.info("👷 Worker RQ Online. Escuchando colas: AI + Descargas.")
        worker.work()
    except Exception as e:
        logger.error(f"❌ El Worker ha muerto: {e}")
