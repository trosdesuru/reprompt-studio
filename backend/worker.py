import logging
import os
import requests
from PIL import Image
from io import BytesIO
from app.core.db import engine
from sqlmodel import Session, select
from rq import Queue, Worker
from app.models.prompt import ImagePrompt
from app.core.redis_config import conn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("rq_worker")


def process_image_ai(prompt_id: str):
    with Session(engine) as session:
        prompt = session.get(ImagePrompt, prompt_id)
        if not prompt or not prompt.image_url:
            return

        try:
            response = requests.get(prompt.image_url)
            img = Image.open(BytesIO(response.content)).convert("RGB")

            session.add(prompt)
            session.commit()

        except Exception as e:
            logger.error(f"❌ [AI] Error en ID {prompt_id}: {e}")


if __name__ == "__main__":
    try:
        queues = [
            Queue("downloads_premium", connection=conn),
            Queue("downloads_free", connection=conn),
        ]

        worker = Worker(queues, connection=conn)
        logger.info("👷 Worker RQ Online. Escuchando colas de Descargas.")
        worker.work()
    except Exception as e:
        logger.error(f"❌ El Worker ha muerto: {e}")
