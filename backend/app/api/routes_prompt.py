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


@router.get("/", response_model=List[PromptResponse])
def get_my_prompts(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        statement = (
            select(ImagePrompt)
            .where(ImagePrompt.user_id == current_user.id)
            .order_by(ImagePrompt.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        prompts = session.exec(statement).all()
        return prompts

    except Exception as e:
        logger.error(f"Error obteniendo prompts para usuario {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail="Error interno al recuperar los datos."
        )


@router.delete("/{prompt_id}")
def delete_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        # <-- ACTUALIZADO
        prompt = session.get(ImagePrompt, prompt_id)
        if not prompt or prompt.user_id != current_user.id:
            raise HTTPException(
                status_code=404, detail="Prompt no encontrado o acceso denegado."
            )

        session.delete(prompt)
        session.commit()
        return {"status": "success", "message": "Prompt eliminado del búnker."}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error borrando prompt {prompt_id}: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar el prompt.")
