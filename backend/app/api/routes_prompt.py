# backend/app/api/routes_prompt.py
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import ImagePrompt
from app.schemas.prompt import PromptCreate

from app.utils.storage import generar_presigned_url, eliminar_de_r2

router = APIRouter()


# Schema para pedir el ticket
class PresignedUrlRequest(BaseModel):
    file_name: str
    content_type: str


# ==========================================
# RUTAS ESTÁTICAS
# ==========================================


@router.post("/generate-upload-url")
def get_upload_url(
    data: PresignedUrlRequest, current_user: User = Depends(get_current_user)
):
    """Devuelve un ticket temporal para subir un archivo directo a R2"""
    ext = data.file_name.split(".")[-1] if "." in data.file_name else "png"
    # Saneamiento de nombre: Evita colisiones y bloquea ejecutables maliciosos lógicamente
    safe_key = f"prompts/{current_user.username}/{uuid.uuid4().hex}.{ext}"

    try:
        urls = generar_presigned_url(safe_key, data.content_type)
        return {"status": "success", "data": urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
def guardar_prompt(
    data: PromptCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        # El frontend ya subió la imagen y solo nos manda la URL pública. ¡FastAPI no sufre!
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
            "message": "Metadata guardada exitosamente",
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

    # 🟢 SANEAMIENTO R2: Destruimos la imagen huérfana de Cloudflare
    if prompt.image_url:
        eliminar_de_r2(prompt.image_url)

    session.delete(prompt)
    session.commit()
    return {
        "status": "success",
        "message": "Prompt y archivo eliminados correctamente del búnker",
    }
