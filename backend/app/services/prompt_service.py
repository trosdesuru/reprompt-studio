import uuid
import logging
from io import BytesIO
from PIL import Image
from typing import List, Optional, Any
from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.user import User
from app.models.prompt import ImagePrompt
from app.core.config import settings
from app.services.storage import s3_client, move_to_permanent, delete_file
from app.utils.storage import eliminar_de_r2
from app.services.security import validate_magic_bytes
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("prompt_service")


class PromptService:
    @staticmethod
    def process_quarantined_upload(
        session: Session,
        current_user: User,
        data: Any,
    ) -> ImagePrompt:
        base_url = settings.R2_PUBLIC_URL.rstrip("/") + "/"
        temp_key = data.image_url.replace(base_url, "")

        if not temp_key.startswith(f"temp/{current_user.id}/"):
            raise HTTPException(status_code=403, detail="Ruta de cuarentena inválida.")

        try:
            response = s3_client.get_object(
                Bucket=settings.R2_BUCKET_NAME, Key=temp_key
            )
            file_bytes = response["Body"].read()
        except Exception as e:
            logger.error(f"Error descargando archivo temporal: {e}")
            raise HTTPException(
                status_code=404, detail="Archivo temporal no encontrado."
            )

        if not validate_magic_bytes(file_bytes):
            delete_file(temp_key)
            raise HTTPException(
                status_code=400, detail="El archivo está corrupto o es malicioso."
            )

        width, height = None, None
        try:
            with Image.open(BytesIO(file_bytes)) as img:
                width, height = img.size
        except Exception:
            pass

        if not width and data.resolution and "x" in data.resolution.lower():
            try:
                w, h = data.resolution.lower().split("x")
                width, height = int(w.strip()), int(h.strip())
            except:
                pass

        permanent_key = temp_key.replace("temp/", "prompts/", 1)
        if not move_to_permanent(temp_key, permanent_key):
            raise HTTPException(
                status_code=500, detail="Error interno al consolidar el archivo."
            )

        final_image_url = f"{base_url}{permanent_key}"
        embedding = EmbeddingService.generate_vector(data.prompt or data.title)
        parsed_dir_id = (
            uuid.UUID(data.directory_id)
            if data.directory_id and data.directory_id != "null"
            else None
        )

        nuevo_prompt = ImagePrompt(
            user_id=current_user.id,
            directory_id=parsed_dir_id,
            image_url=final_image_url,
            title=data.title,
            prompt=data.prompt,
            negative_prompt=data.negative_prompt,
            software=data.software,
            model=data.model,
            sampler=data.sampler,
            steps=data.steps,
            cfg_scale=data.cfg_scale,
            seed=data.seed,
            resolution=data.resolution,
            width=width,
            height=height,
            extra_data=data.extra_data,
            embedding=embedding,
            ai_processed=False,
        )

        session.add(nuevo_prompt)
        session.commit()
        session.refresh(nuevo_prompt)
        nuevo_prompt.embedding = []

        return nuevo_prompt

    @staticmethod
    def get_studio_prompts(
        session: Session, current_user: User, directory_id: Optional[str]
    ) -> List[ImagePrompt]:
        statement = select(ImagePrompt).where(ImagePrompt.user_id == current_user.id)

        if directory_id and directory_id != "null":
            statement = statement.where(
                ImagePrompt.directory_id == uuid.UUID(directory_id)
            )

        statement = statement.order_by(ImagePrompt.created_at.desc())
        resultados = session.exec(statement).all()

        for prompt in resultados:
            prompt.embedding = []

        return resultados

    @staticmethod
    def delete_single_prompt(
        session: Session, current_user: User, prompt_id: uuid.UUID
    ):
        prompt = session.exec(
            select(ImagePrompt)
            .where(ImagePrompt.id == prompt_id)
            .where(ImagePrompt.user_id == current_user.id)
        ).first()

        if not prompt:
            raise HTTPException(
                status_code=404, detail="El recurso no existe o no tienes permisos."
            )

        if prompt.image_url:
            try:
                eliminar_de_r2(prompt.image_url)
            except Exception as e:
                logger.error(f"⚠️ Error al borrar archivo en R2: {e}")

        session.delete(prompt)
        session.commit()

    @staticmethod
    def delete_batch_prompts(
        session: Session, current_user: User, prompt_ids: List[uuid.UUID]
    ):
        if not prompt_ids:
            return 0, []

        prompts_a_borrar = session.exec(
            select(ImagePrompt).where(
                ImagePrompt.id.in_(prompt_ids), ImagePrompt.user_id == current_user.id
            )
        ).all()

        if not prompts_a_borrar:
            raise HTTPException(
                status_code=404, detail="No se encontraron las imágenes."
            )

        for prompt in prompts_a_borrar:
            if prompt.image_url:
                eliminar_de_r2(prompt.image_url)
            session.delete(prompt)

        session.commit()
        return len(prompts_a_borrar), [p.id for p in prompts_a_borrar]
