import logging

import uuid
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import ImagePrompt
from app.schemas.prompt import PromptCreate
from app.api.deps import get_current_user, RateLimiter
from app.core.config import settings
from app.services.storage import s3_client
from app.utils.storage import eliminar_de_r2
from app.services.storage import move_to_permanent, delete_file
from app.services.security import validate_magic_bytes
from app.services.storage import s3_client
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("routes_prompt")
router = APIRouter()


class BatchDeleteRequest(BaseModel):
    prompt_ids: List[uuid.UUID]


class PresignedUrlRequest(BaseModel):
    file_name: str
    content_type: str


# ==========================================
# RUTAS ESTÁTICAS
# ==========================================


@router.post(
    "/generate-upload-url",
    dependencies=[Depends(RateLimiter(max_requests=100, window_seconds=60))],
)
def get_upload_url(
    data: PresignedUrlRequest, current_user: User = Depends(get_current_user)
):
    file_extension = data.file_name.split(".")[-1].lower()
    if file_extension not in ["png", "jpg", "jpeg", "webp"]:
        raise HTTPException(status_code=400, detail="Extensión no permitida.")

    safe_filename = f"{uuid.uuid4().hex}.{file_extension}"
    s3_key = f"temp/{current_user.id}/{safe_filename}"

    try:
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.R2_BUCKET_NAME,
                "Key": s3_key,
                "ContentType": f"image/{'jpeg' if file_extension == 'jpg' else file_extension}",
            },
            ExpiresIn=300,
        )

        base_url = settings.R2_PUBLIC_URL.rstrip("/")

        return {
            "status": "success",
            "upload_url": presigned_url,
            "key": s3_key,
            "file_url": f"{base_url}/{s3_key}",
        }
    except Exception as e:
        logger.error(f"Error AWS/R2: {e}")
        raise HTTPException(
            status_code=500, detail="Error generando acceso seguro al servidor."
        )


@router.post(
    "/save", dependencies=[Depends(RateLimiter(max_requests=100, window_seconds=60))]
)
def guardar_prompt(
    data: PromptCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):

    is_valid = validate_magic_bytes(data.image_url)

    base_url = settings.R2_PUBLIC_URL.rstrip("/") + "/"
    old_key = data.image_url.replace(base_url, "")

    if not old_key.startswith(f"temp/{current_user.id}/"):
        raise HTTPException(status_code=403, detail="No se puede guardar archivo")

    if not is_valid:
        delete_file(old_key)
        raise HTTPException(
            status_code=400, detail="El archivo está corrupto o es malicioso."
        )

    new_key = old_key.replace("temp/", "prompts/", 1)

    if not move_to_permanent(old_key, new_key):
        raise HTTPException(
            status_code=500, detail="Error interno al consolidar el archivo."
        )

    final_image_url = f"{base_url}{new_key}"
    data.image_url = final_image_url

    text_to_vectorize = f"Title: {data.title}. Prompt: {data.prompt}. Software: {data.software}. Model: {data.model}"
    vector_data = EmbeddingService.generate_vector(text_to_vectorize)

    try:
        nuevo_prompt = ImagePrompt(
            user_id=current_user.id,
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
            image_url=data.image_url,
            embedding=vector_data,
            extra_data=data.extra_data,
        )
        session.add(nuevo_prompt)
        session.commit()
        session.refresh(nuevo_prompt)

        return {
            "status": "success",
            "message": "Imagen guardada con éxito",
            "data": nuevo_prompt,
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def obtener_mis_prompts(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(ImagePrompt)
        .where(ImagePrompt.user_id == current_user.id)
        .order_by(ImagePrompt.created_at.desc())
    )
    resultados = session.exec(statement).all()
    return resultados


# ==========================================
# RUTAS DINÁMICAS
# ==========================================


@router.delete("/{prompt_id}")
def eliminar_prompt(
    prompt_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(ImagePrompt)
        .where(ImagePrompt.id == prompt_id)
        .where(ImagePrompt.user_id == current_user.id)
    )
    prompt = session.exec(statement).first()

    if not prompt:
        raise HTTPException(
            status_code=404,
            detail="Prompt no encontrado o no tienes permiso para borrarlo",
        )

    # 🟢 SANEAMIENTO R2: Destruimos la imagen huérfana de Cloudflare
    if prompt.image_url:
        eliminar_de_r2(prompt.image_url)

    session.delete(prompt)
    session.commit()
    return {
        "status": "success",
        "message": "Prompt y archivo eliminados correctamente del studio",
    }


@router.post("/batch-delete")
def eliminar_prompts_lote(
    data: BatchDeleteRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Elimina múltiples prompts en una sola petición HTTP para no saturar la red."""
    if not data.prompt_ids:
        return {"status": "success", "message": "Ningún ID proporcionado"}

    statement = select(ImagePrompt).where(
        ImagePrompt.id.in_(data.prompt_ids), ImagePrompt.user_id == current_user.id
    )
    prompts_a_borrar = session.exec(statement).all()

    if not prompts_a_borrar:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron las imágenes o no tienes permiso.",
        )

    for prompt in prompts_a_borrar:
        if prompt.image_url:
            eliminar_de_r2(prompt.image_url)
        session.delete(prompt)

    session.commit()

    return {
        "status": "success",
        "message": f"{len(prompts_a_borrar)} prompts eliminados correctamente",
        "deleted_ids": [p.id for p in prompts_a_borrar],
    }
