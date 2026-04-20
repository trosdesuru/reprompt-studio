import uuid
import html
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session

from app.core.db import get_session
from app.api.deps import get_current_user, RateLimiter
from app.models.user import User
from app.services.storage import s3_client
from app.core.config import settings
from app.services.prompt_service import PromptService

router = APIRouter()


class BatchDeleteRequest(BaseModel):
    prompt_ids: List[uuid.UUID]


class PresignedUrlRequest(BaseModel):
    file_name: str
    content_type: str


class StudioSaveRequest(BaseModel):
    image_url: str = Field(..., description="URL temporal en R2")
    title: str = Field(..., max_length=150)
    directory_id: Optional[str] = None
    prompt: Optional[str] = Field(None, max_length=20000)
    negative_prompt: Optional[str] = Field(None, max_length=20000)
    software: Optional[str] = Field("Desconocido", max_length=50)
    model: Optional[str] = Field(None, max_length=150)
    sampler: Optional[str] = Field(None, max_length=100)
    steps: Optional[str] = Field(None, max_length=20)
    cfg_scale: Optional[str] = Field(None, max_length=20)
    seed: Optional[str] = Field(None, max_length=50)
    resolution: Optional[str] = Field(None, max_length=50)
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("title", "prompt", "negative_prompt", mode="before")
    @classmethod
    def sanitize_text(cls, value: Optional[str]) -> Optional[str]:
        if not value:
            return value
        cleaned = value.strip()
        if "<script" in cleaned.lower() or "javascript:" in cleaned.lower():
            raise ValueError("Contenido bloqueado por seguridad.")
        return html.escape(cleaned)


@router.post("/generate-upload-url")
def generate_upload_url(
    request: PresignedUrlRequest, current_user: User = Depends(get_current_user)
):
    try:
        unique_id = str(uuid.uuid4())[:8]
        safe_filename = request.file_name.replace(" ", "_")
        object_key = f"temp/{current_user.id}/{unique_id}_{safe_filename}"

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.R2_BUCKET_NAME,
                "Key": object_key,
                "ContentType": request.content_type,
            },
            ExpiresIn=3600,
        )
        base_url = settings.R2_PUBLIC_URL.rstrip("/")
        return {
            "status": "success",
            "upload_url": presigned_url,
            "file_url": f"{base_url}/{object_key}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error con Cloudflare R2")


@router.post("/save")
def save_studio_prompt(
    data: StudioSaveRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    nuevo_prompt = PromptService.process_quarantined_upload(
        session=session,
        current_user=current_user,
        data=data,
    )
    return {"status": "success", "data": nuevo_prompt}


@router.post("/upload-studio")
async def upload_to_studio(
    file: UploadFile = File(...),
    directory_id: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Dropzone Contextual: Sube, extrae dimensiones, vectoriza y asigna."""
    nuevo_prompt = await PromptService.process_and_save_studio_upload(
        session, current_user, file, directory_id
    )
    return {"status": "success", "data": nuevo_prompt}


@router.post("/batch-delete")
def eliminar_prompts_lote(
    data: BatchDeleteRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    count, deleted_ids = PromptService.delete_batch_prompts(
        session, current_user, data.prompt_ids
    )
    return {
        "status": "success",
        "message": f"{count} prompts eliminados correctamente",
        "deleted_ids": deleted_ids,
    }


@router.get("/studio")
def obtener_prompts_studio(
    directory_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Obtiene las imágenes para el PromptGrid."""
    resultados = PromptService.get_studio_prompts(session, current_user, directory_id)
    return {"status": "success", "data": resultados}


@router.delete("/{prompt_id}")
def eliminar_prompt(
    prompt_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    PromptService.delete_single_prompt(session, current_user, prompt_id)
    return {
        "status": "success",
        "message": "Imagen y prompt eliminados permanentemente del multiverso.",
    }
