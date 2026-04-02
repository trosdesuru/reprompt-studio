import logging
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
            extra_data=data.extra_data,
        )
        session.add(nuevo_prompt)
        session.commit()
        session.refresh(nuevo_prompt)
        return {
            "status": "success",
            "message": "Prompt guardado correctamente",
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
    # Buscamos solo los prompts del usuario logueado y los ordenamos de más nuevo a más viejo
    statement = (
        select(ImagePrompt)
        .where(ImagePrompt.user_id == current_user.id)
        .order_by(ImagePrompt.created_at.desc())
    )
    resultados = session.exec(statement).all()
    return resultados


# ==========================================
# 🟢 2. RUTAS DINÁMICAS (Siempre abajo)
# ==========================================


@router.delete("/{prompt_id}")
def eliminar_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Buscamos el prompt asegurándonos de que le pertenece al usuario
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

    session.delete(prompt)
    session.commit()
    return {"status": "success", "message": "Prompt eliminado del búnker"}


@router.post("/upload")
async def upload_and_save_prompt(
    file: UploadFile = File(...),
    prompt_data: PromptCreate = Depends(prompt_form_dependency),  # <-- CLEAN CODE AQUÍ
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Recibe la imagen y sus metadatos. Sube la imagen a R2 y guarda la info en PostgreSQL.
    """
    try:
        # 1. Validar la imagen
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
            **prompt_data.model_dump(
                exclude={"image_url", "extra_data"}
            ),  # Excluimos los que inyectamos o no usamos directamente
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
