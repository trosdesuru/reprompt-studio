# backend/app/api/routes_prompt.py
import logging
import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select

from app.core.db import get_session
from app.api.deps import get_current_user, RateLimiter
from app.models.user import User
from app.models.prompt import ImagePrompt
from app.schemas.prompt import PromptCreate
from app.core.config import settings
from app.services.storage import s3_client, move_to_permanent, delete_file
from app.utils.storage import eliminar_de_r2
from app.services.security import validate_magic_bytes
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("routes_prompt")
router = APIRouter()


class BatchDeleteRequest(BaseModel):
    prompt_ids: List[uuid.UUID]


class PresignedUrlRequest(BaseModel):
    file_name: str
    content_type: str


# ==============================================
# RUTAS DE EXTRACCIÓN Y STUDIO (NUEVAS - FASE 5)
# ==============================================


@router.post("/upload-studio")
async def upload_to_studio(
    file: UploadFile = File(...),
    directory_id: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    🚀 Dropzone Contextual:
    Recibe el archivo físico del frontend, lo sube a R2, lo vectoriza
    y lo asigna directamente a la carpeta indicada.
    """
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["png", "jpg", "jpeg", "webp"]:
        raise HTTPException(status_code=400, detail="Extensión no permitida.")

    # 1. Subida real a Cloudflare R2
    safe_filename = f"{uuid.uuid4().hex}.{file_extension}"
    s3_key = f"prompts/{current_user.id}/{safe_filename}"

    try:
        file_content = await file.read()
        s3_client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=f"image/{'jpeg' if file_extension == 'jpg' else file_extension}",
        )
        base_url = settings.R2_PUBLIC_URL.rstrip("/")
        file_url = f"{base_url}/{s3_key}"
    except Exception as e:
        logger.error(f"Error subiendo archivo a R2: {e}")
        raise HTTPException(
            status_code=500, detail="Error al subir la imagen al servidor."
        )

    # 2. Vectorización IA (usamos el nombre por ahora como contexto)
    embedding = EmbeddingService.generate_vector(file.filename)

    # 3. Guardar en Base de Datos asignado a su Carpeta
    parsed_dir_id = (
        uuid.UUID(directory_id) if directory_id and directory_id != "null" else None
    )

    nuevo_prompt = ImagePrompt(
        user_id=current_user.id,
        directory_id=parsed_dir_id,
        image_url=file_url,
        title=file.filename,
        prompt=file.filename,
        embedding=embedding,
    )

    session.add(nuevo_prompt)
    session.commit()
    session.refresh(nuevo_prompt)

    return {"status": "success", "data": nuevo_prompt}


@router.get("/studio")
def obtener_prompts_studio(
    directory_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Obtiene las imágenes de una carpeta específica para el PromptGrid."""
    statement = select(ImagePrompt).where(ImagePrompt.user_id == current_user.id)

    if directory_id and directory_id != "null":
        statement = statement.where(ImagePrompt.directory_id == uuid.UUID(directory_id))
    else:
        # Si no hay ID, devolvemos solo las de la raíz
        statement = statement.where(ImagePrompt.directory_id == None)

    statement = statement.order_by(ImagePrompt.created_at.desc())
    resultados = session.exec(statement).all()

    return {"status": "success", "data": resultados}


# ===============================================================
# RUTAS ESTÁTICAS (SISTEMA DE PRE-FIRMADO ANTIGUO/COMPLEMENTARIO)
# ===============================================================


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

    content_type = data.content_type if data.content_type else "image/png"

    try:
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.R2_BUCKET_NAME,
                "Key": s3_key,
                "ContentType": content_type,
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
