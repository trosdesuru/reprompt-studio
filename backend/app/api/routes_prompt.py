import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlmodel import Session

from app.core.db import get_session
from app.api.deps import get_current_user, RateLimiter
from app.models.user import User
from app.schemas.prompt import PromptCreate
from app.services.prompt_service import PromptService

router = APIRouter()


class BatchDeleteRequest(BaseModel):
    prompt_ids: List[uuid.UUID]


class PresignedUrlRequest(BaseModel):
    file_name: str
    content_type: str


class StudioSaveRequest(BaseModel):
    temp_image_url: str
    file_name: str
    directory_id: Optional[str] = None


@router.post("/save-studio")
def save_studio_prompt(
    data: StudioSaveRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Ruta que consolida un archivo subido previamente a la zona temp/
    """
    nuevo_prompt = PromptService.process_quarantined_upload(
        session=session,
        current_user=current_user,
        temp_image_url=data.temp_image_url,
        file_name=data.file_name,
        directory_id=data.directory_id,
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
