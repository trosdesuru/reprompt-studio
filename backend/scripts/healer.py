# backend/scripts/healer.py
import sys
import os
import logging
import requests
from PIL import Image

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select, or_
from app.core.db import engine

# 🟢 1. Import ALL related models so SQLAlchemy builds the metadata correctly
from app.models.prompt import ImagePrompt
from app.models.user import User  # Fixed: Import User
from app.models.directory import Directory  # Fixed: Import Directory just in case

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("healer")


def heal_missing_dimensions():
    logger.info("🩺 Iniciando el Sanador de Dimensiones en Segundo Plano...")

    with Session(engine) as session:
        statement = select(ImagePrompt.id).where(
            or_(ImagePrompt.width == None, ImagePrompt.height == None)
        )
        ids_rotos = session.exec(statement).all()

        if not ids_rotos:
            logger.info(
                "✨ ¡Base de datos sana! Todas las imágenes tienen dimensiones."
            )
            return

        logger.info(
            f"🩹 Se han encontrado {len(ids_rotos)} imágenes sin dimensiones. Procesando..."
        )

        sanados = 0
        errores = 0

        for prompt_id in ids_rotos:
            prompt = session.get(ImagePrompt, prompt_id)
            if not prompt or not prompt.image_url:
                continue

            try:
                response = requests.get(prompt.image_url, stream=True, timeout=10)
                response.raise_for_status()

                img = Image.open(response.raw)
                width, height = img.size

                prompt.width = width
                prompt.height = height
                prompt.resolution = f"{width}x{height}"

                session.add(prompt)
                session.commit()

                sanados += 1
                logger.info(f"✅ Sanado Prompt {prompt.id}: {width}x{height}")

            except Exception as e:
                # 🟢 2. Rollback FIRST before doing anything else
                session.rollback()
                errores += 1
                # We can safely use prompt_id here, but avoid prompt.image_url if it requires lazy loading after rollback
                logger.warning(f"⚠️ Fallo al sanar ID {prompt_id}: {e}")

        logger.info(f"🏁 Ejecución completada. Sanados: {sanados} | Errores: {errores}")


if __name__ == "__main__":
    heal_missing_dimensions()
