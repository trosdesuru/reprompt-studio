import uuid
import logging
import urllib.parse

from rq import Queue
from io import BytesIO
from PIL import Image
from typing import List, Optional, Any
from fastapi import HTTPException, status
from sqlmodel import (
    Session,
    select,
    col,
)

from worker import process_image_ai

from app.models.user import User
from app.models.prompt import ImagePrompt

from app.utils.storage import eliminar_de_r2

from app.core.redis_config import conn
from app.core.config import settings

from app.services.storage import s3_client, move_to_permanent, delete_file
from app.services.security import validate_magic_bytes

logger = logging.getLogger("prompt_service")

ai_queue = Queue("default", connection=conn)


def guardar_prompt_extractor(prompt_data: dict, session: Session):
    try:
        new_prompt = ImagePrompt(**prompt_data)
        session.add(new_prompt)
        session.commit()
        session.refresh(new_prompt)

        ai_queue.enqueue(
            process_image_ai, prompt_id=str(new_prompt.id), job_timeout="5m"
        )

        logger.info(
            f"📡 [ENQUEUE] Tarea de IA enviada al Worker para el prompt {new_prompt.id}"
        )
        return new_prompt

    except Exception as e:
        session.rollback()
        logger.error(f"❌ Error al guardar prompt: {e}")
        raise e


class PromptService:
    @staticmethod
    def process_quarantined_upload(
        session: Session,
        current_user: "User",  # Type hint genérico si no lo importas directamente
        data: Any,
    ) -> "ImagePrompt":

        # =================================================================
        # 🛡️ 1. ESCUDO ANTI PATH-TRAVERSAL Y SSRF (EARLY RETURN / FAIL FAST)
        # =================================================================
        # Decodificamos la URL recibida para atrapar intentos de ofuscación
        # Ej: '%2e%2e%2f' se decodifica como '../'
        decoded_url = urllib.parse.unquote(data.image_url).lower()

        if ".." in decoded_url or "../" in decoded_url:
            logger.warning(
                f"🚨 [SECURITY] Intento de Path Traversal detectado por el usuario {current_user.id}: {data.image_url}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Intento de evasión de directorio detectado (Path Traversal).",
            )

        # =================================================================
        # 📂 2. PROCESAMIENTO Y VALIDACIÓN DE RUTAS
        # =================================================================
        base_url = settings.R2_PUBLIC_URL.rstrip("/") + "/"
        temp_key = data.image_url.replace(base_url, "")

        if not temp_key.startswith(f"temp/{current_user.id}/"):
            logger.warning(
                f"🚨 [SECURITY] Ruta de cuarentena inválida. Esperado: temp/{current_user.id}/, Recibido: {temp_key}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ruta de cuarentena inválida o pertenece a otro usuario.",
            )

        # =================================================================
        # 🔍 3. LECTURA DE METADATOS Y TAMAÑO
        # =================================================================
        try:
            head = s3_client.head_object(Bucket=settings.R2_BUCKET_NAME, Key=temp_key)
            size_bytes = head["ContentLength"]
            size_kb = size_bytes / 1024
            logger.info(
                f"📥 [QUARANTINE-IN] Recibido desde Temp: {temp_key} | Tamaño: {size_kb:.2f} KB"
            )
        except Exception as e:
            logger.error(
                f"❌ [QUARANTINE-ERROR] No se pudo leer el head_object de {temp_key}: {e}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Archivo temporal no encontrado en el almacenamiento.",
            )

        # =================================================================
        # 🛡️ 4. VALIDACIÓN DE BYTES MÁGICOS (SEGURIDAD DE ARCHIVOS)
        # =================================================================
        try:
            # 🟢 Aumentamos el rango a 8KB para pillar todos los metadatos JPEG/WebP
            response = s3_client.get_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=temp_key,
                Range="bytes=0-8192",
            )
            file_bytes = response["Body"].read()
        except Exception as e:
            logger.error(f"❌ [QUARANTINE-ERROR] Fallo al descargar bytes: {e}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Error leyendo el contenido del archivo temporal.",
            )

        if not validate_magic_bytes(file_bytes):
            delete_file(temp_key)  # 🔥 Destruir archivo corrupto o malicioso
            logger.warning(
                f"🚨 [SECURITY] Magic bytes inválidos detectados. Archivo destruido: {temp_key}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo está corrupto o es malicioso.",
            )

        # =================================================================
        # 📐 5. EXTRACCIÓN DE DIMENSIONES (PIL)
        # =================================================================
        width = getattr(data, "width", None)
        height = getattr(data, "height", None)

        try:
            with Image.open(BytesIO(file_bytes)) as img:
                width, height = img.size
                logger.info(
                    f"📏 [QUARANTINE-SIZE] Imagen detectada en Backend: {width}x{height}"
                )
        except Exception as e:
            logger.warning(
                f"⚠️ [QUARANTINE-WARN] PIL no pudo leer dimensiones de los 8KB: {e}"
            )
            pass

        if not width or not height:
            try:
                with Image.open(BytesIO(file_bytes)) as img:
                    width, height = img.size
                    logger.info(
                        f"📏 [RESCATE] PIL extrajo dimensiones: {width}x{height}"
                    )
            except Exception as e:
                logger.warning(f"⚠️ [QUARANTINE-WARN] PIL falló también: {e}")
                pass

        if (
            not width
            and getattr(data, "resolution", None)
            and "x" in data.resolution.lower()
        ):
            try:
                w, h = data.resolution.lower().split("x")
                width, height = int(w.strip()), int(h.strip())
            except Exception:
                pass

        # =================================================================
        # 📦 6. CONSOLIDACIÓN A ALMACENAMIENTO PERMANENTE Y DB
        # =================================================================
        permanent_key = temp_key.replace("temp/", "prompts/", 1)

        if not move_to_permanent(temp_key, permanent_key):
            logger.error(f"❌ [STORAGE-ERROR] Falló move_to_permanent para {temp_key}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al consolidar el archivo.",
            )

        final_image_url = f"{base_url}{permanent_key}"

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
            embedding=None,
        )

        session.add(nuevo_prompt)
        session.commit()
        session.refresh(nuevo_prompt)

        # =================================================================
        # 🤖 7. ENVÍO A COLA DE BACKGROUND (WORKERS IA)
        # =================================================================
        ai_queue.enqueue(
            process_image_ai, prompt_id=str(nuevo_prompt.id), job_timeout="5m"
        )

        logger.info(
            f"📡 [ENQUEUE] Subida individual enviada al Worker: {nuevo_prompt.id}"
        )

        return nuevo_prompt

    # 🟢 MODIFICADO: Ahora acepta page, limit y sort y los aplica al statement de SQLModel
    @staticmethod
    def get_studio_prompts(
        session: Session,
        current_user: User,
        directory_id: Optional[str],
        page: int = 1,
        limit: int = 20,
        sort: str = "newest",
    ) -> List[ImagePrompt]:

        statement = select(ImagePrompt).where(ImagePrompt.user_id == current_user.id)

        # Filtro por carpeta
        if directory_id == "root":
            statement = statement.where(ImagePrompt.directory_id == None)
        elif directory_id and directory_id != "null":
            statement = statement.where(
                ImagePrompt.directory_id == uuid.UUID(directory_id)
            )

        # 🟢 Lógica de ordenación (Sorting)
        if sort == "oldest":
            statement = statement.order_by(col(ImagePrompt.created_at).asc())
        elif sort == "software":
            # Ordenamos por software (A-Z) y luego por fecha para desempatar
            statement = statement.order_by(
                col(ImagePrompt.software).asc(), col(ImagePrompt.created_at).desc()
            )
        else:
            # Por defecto "newest"
            statement = statement.order_by(col(ImagePrompt.created_at).desc())

        # 🟢 Lógica de paginación (Offset y Limit)
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

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

    # 🟢 NUEVO: Función para Mover en Lote (Bulk Move)
    @staticmethod
    def move_batch_prompts(
        session: Session,
        current_user: User,
        prompt_ids: List[uuid.UUID],
        new_directory_id: Optional[str],
    ) -> int:
        if not prompt_ids:
            return 0

        # Buscamos los prompts que pertenezcan al usuario
        prompts_a_mover = session.exec(
            select(ImagePrompt).where(
                ImagePrompt.id.in_(prompt_ids), ImagePrompt.user_id == current_user.id
            )
        ).all()

        if not prompts_a_mover:
            raise HTTPException(
                status_code=404, detail="No se encontraron las imágenes."
            )

        # Parseamos el ID de destino
        parsed_dir_id = None
        if new_directory_id and new_directory_id != "null":
            try:
                parsed_dir_id = uuid.UUID(new_directory_id)
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="ID de directorio de destino inválido."
                )

        # Actualizamos en masa
        for prompt in prompts_a_mover:
            prompt.directory_id = parsed_dir_id
            session.add(prompt)

        session.commit()

        return len(prompts_a_mover)

    @staticmethod
    def update_prompt_directory(
        session: Session,
        current_user: User,
        prompt_id: uuid.UUID,
        new_directory_id: Optional[str],
    ) -> "ImagePrompt":

        prompt = session.exec(
            select(ImagePrompt)
            .where(ImagePrompt.id == prompt_id)
            .where(ImagePrompt.user_id == current_user.id)
        ).first()

        if not prompt:
            raise HTTPException(
                status_code=404, detail="Prompt no encontrado o no tienes permisos."
            )

        parsed_dir_id = None
        if new_directory_id and new_directory_id != "null":
            try:
                parsed_dir_id = uuid.UUID(new_directory_id)
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="ID de directorio inválido."
                )

        prompt.directory_id = parsed_dir_id
        session.add(prompt)
        session.commit()
        session.refresh(prompt)

        prompt.embedding = []

        return prompt

    @staticmethod
    def update_prompt(
        session: Session,
        current_user: User,
        prompt_id: uuid.UUID,
        data: Any,  # Pasamos el PromptPatchRequest
    ) -> "ImagePrompt":

        prompt = session.exec(
            select(ImagePrompt)
            .where(ImagePrompt.id == prompt_id)
            .where(ImagePrompt.user_id == current_user.id)
        ).first()

        if not prompt:
            raise HTTPException(
                status_code=404, detail="Prompt no encontrado o no tienes permisos."
            )

        # Convertimos el modelo de Pydantic a diccionario ignorando los valores "unset" (no enviados)
        update_data = data.model_dump(exclude_unset=True)

        # Manejo especial para mover de carpeta (directory_id)
        if "directory_id" in update_data:
            dir_id = update_data["directory_id"]
            if dir_id == "null" or dir_id is None:
                prompt.directory_id = None
            else:
                try:
                    prompt.directory_id = uuid.UUID(dir_id)
                except ValueError:
                    raise HTTPException(
                        status_code=400, detail="ID de directorio inválido."
                    )
            # Lo sacamos del dict para que el setattr dinámico no falle
            del update_data["directory_id"]

        # 🟢 Magia: Iteramos y guardamos cualquier otro campo (title, prompt, model...)
        for key, value in update_data.items():
            setattr(prompt, key, value)

        # Si cambian el prompt, reseteamos el embedding para que el buscador lo vuelva a vectorizar
        if "prompt" in update_data:
            prompt.embedding = None

        session.add(prompt)
        session.commit()
        session.refresh(prompt)

        return prompt
