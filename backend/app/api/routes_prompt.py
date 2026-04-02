import logging
import base64
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import ImagePrompt

from app.schemas.prompt import PromptCreate, PromptResponse, prompt_form_dependency
from app.utils.storage import subir_imagen_a_r2

logger = logging.getLogger("api_prompts")
router = APIRouter()


@router.post("/save")
def guardar_prompt(
    data: PromptCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        url_final = data.image_url

        if data.image_url and data.image_url.startswith("data:image"):
            header, encoded_data = data.image_url.split(",", 1)
            content_type = header.split(";")[0].split(":")[1]
            ext = content_type.split("/")[1]

            file_bytes = base64.b64decode(encoded_data)

            file_name = f"prompts/{current_user.username}/{uuid.uuid4().hex}.{ext}"

            url_final = subir_imagen_a_r2(file_bytes, file_name, content_type)

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
            image_url=url_final,
            extra_data=data.extra_data,
        )
        session.add(nuevo_prompt)
        session.commit()
        session.refresh(nuevo_prompt)

        return {
            "status": "success",
            "message": "Metadata guardada y archivo subido a R2",
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
    prompt_id: int,
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

    # NOTA: Opcionalmente, aquí podríamos llamar a s3_client.delete_object(...) para borrar también de R2

    session.delete(prompt)
    session.commit()
    return {"status": "success", "message": "Prompt eliminado del búnker"}


@router.post("/upload")
async def upload_and_save_prompt(
    file: UploadFile = File(...),
    prompt_data: PromptCreate = Depends(prompt_form_dependency),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Recibe la imagen y sus metadatos. Sube la imagen a R2 y guarda la info en PostgreSQL.
    """
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail="El archivo debe ser una imagen."
            )

        file_bytes = await file.read()

        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{current_user.username}/{uuid.uuid4().hex}.{ext}"

        secure_url = subir_imagen_a_r2(file_bytes, unique_filename, file.content_type)

        new_prompt = ImagePrompt(
            user_id=current_user.id,
            image_url=secure_url,
            **prompt_data.model_dump(exclude={"image_url", "extra_data"}),
        )

        session.add(new_prompt)
        session.commit()
        session.refresh(new_prompt)

        return {
            "status": "success",
            "message": "Imagen subida a la nube y prompt guardado con éxito.",
            "data": {"id": new_prompt.id, "image_url": secure_url},
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en upload_and_save_prompt: {e}")
        session.rollback()
        raise HTTPException(
            status_code=500, detail="Error interno al procesar la imagen."
        )
