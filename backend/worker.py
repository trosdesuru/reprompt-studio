import logging
import time
import os
import psutil
import gc

from rq import Queue, Worker

from sqlmodel import Session, select

from app.models.user import User
from app.models.directory import Directory
from app.models.prompt import ImagePrompt

from app.core.db import engine
from app.core.redis_config import conn

from app.services.embedding_service import EmbeddingService
from app.services.wd14_service import WD14Tagger

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("rq_worker")


def process_image_ai(prompt_id: str):
    # Fotografía de Memoria Inicial del proceso Worker
    proceso = psutil.Process(os.getpid())
    ram_inicial = proceso.memory_info().rss / (1024 * 1024)

    with Session(engine) as session:
        prompt = session.get(ImagePrompt, prompt_id)
        if not prompt:
            logger.error(f"❌ [WORKER] Prompt {prompt_id} no encontrado en DB.")
            return

        try:
            logger.info(
                f"🧠 [WORKER] Iniciando procesamiento de IA para: {prompt_id}. RAM Base: {ram_inicial:.2f}MB"
            )
            texto_a_vectorizar = prompt.prompt or prompt.title or "Generative Art"

            # --- MEDICIÓN DE EMBEDDINGS ---
            start_time_emb = time.time()
            vector = EmbeddingService.generate_vector(texto_a_vectorizar)
            prompt.embedding = vector
            tiempo_emb = round(time.time() - start_time_emb, 2)

            ram_post_embed = proceso.memory_info().rss / (1024 * 1024)
            logger.info(
                f"📐 [WORKER] Embeddings generados ({tiempo_emb}s). RAM: {ram_post_embed:.2f}MB (Δ {ram_post_embed - ram_inicial:+.2f}MB)"
            )

            # --- MEDICIÓN DE ETIQUETAS WD14 ---
            logger.info(f"🏷️ [WORKER] Extrayendo etiquetas visuales...")
            start_time_tags = time.time()

            wd14_manager = WD14Tagger()
            etiquetas = wd14_manager.get_tags(prompt.image_url)
            prompt.auto_tags = etiquetas

            tiempo_tags = round(time.time() - start_time_tags, 2)

            ram_post_tags = proceso.memory_info().rss / (1024 * 1024)
            logger.info(
                f"🏷️ [WORKER] Etiquetas listas ({tiempo_tags}s). RAM: {ram_post_tags:.2f}MB (Δ {ram_post_tags - ram_post_embed:+.2f}MB)"
            )

            # --- GUARDADO Y LIMPIEZA ---
            session.add(prompt)
            session.commit()

            # Forzamos la recolección de basura para recuperar memoria
            gc.collect()
            ram_final = proceso.memory_info().rss / (1024 * 1024)

            logger.info(
                f"✅ [WORKER] IA completada con éxito. RAM final: {ram_final:.2f}MB (Δ total {ram_final - ram_inicial:+.2f}MB)"
            )

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
