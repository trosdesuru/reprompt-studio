import uuid
import logging
from typing import Optional, Annotated
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
)
from sqlmodel import Session

from app.core.db import get_session
from app.api.deps import get_current_user, verify_prompt_quota
from app.models.user import User
from app.services.storage import s3_client
from app.core.config import settings
from app.services.prompt_service import PromptService

from app.schemas.prompt import (
    PresignedUrlRequest,
    StudioSaveRequest,
    BatchDeleteRequest,
    PromptPatchRequest,
    BulkMoveRequest,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/generate-upload-url",
    responses={500: {"description": "Error de comunicación con Cloudflare R2"}},
)
def generate_upload_url(
    current_user: Annotated[User, Depends(verify_prompt_quota)],
    request: PresignedUrlRequest,
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
                "CacheControl": "public, max-age=31536000, immutable",
            },
            ExpiresIn=3600,
        )
        base_url = settings.R2_PUBLIC_URL.rstrip("/")
        return {
            "status": "success",
            "upload_url": presigned_url,
            "file_url": f"{base_url}/{object_key}",
        }
    except Exception:
        logger.exception("Fallo al generar URL presignada en R2")
        raise HTTPException(status_code=500, detail="Error con Cloudflare R2")


@router.post("/save")
def save_studio_prompt(
    current_user: Annotated[User, Depends(verify_prompt_quota)],
    session: Annotated[Session, Depends(get_session)],
    data: StudioSaveRequest,
):
    nuevo_prompt = PromptService.process_quarantined_upload(
        session=session,
        current_user=current_user,
        data=data,
    )

    return {"status": "success", "data": nuevo_prompt}


@router.post("/upload-studio")
async def upload_to_studio(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(verify_prompt_quota)],
    file: Annotated[UploadFile, File(...)],
    directory_id: Annotated[Optional[str], Form()] = None,
):
    nuevo_prompt = await PromptService.process_and_save_studio_upload(
        session, current_user, file, directory_id
    )
    return {"status": "success", "data": nuevo_prompt}


@router.post("/bulk/delete")
def eliminar_prompts_lote(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    data: BatchDeleteRequest,
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
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    directory_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    sort: str = "newest",
):
    resultados = PromptService.get_studio_prompts(
        session, current_user, directory_id, page=page, limit=limit, sort=sort
    )
    return {"status": "success", "data": resultados}


@router.patch("/{prompt_id}")
def actualizar_prompt(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    prompt_id: uuid.UUID,
    data: PromptPatchRequest,
):
    prompt_actualizado = PromptService.update_prompt(
        session=session,
        current_user=current_user,
        prompt_id=prompt_id,
        data=data,
    )
    return {"status": "success", "data": prompt_actualizado}


@router.put("/bulk/move")
def mover_prompts_lote(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    data: BulkMoveRequest,
):
    count = PromptService.move_batch_prompts(
        session, current_user, data.prompt_ids, data.directory_id
    )
    return {
        "status": "success",
        "message": f"{count} prompts movidos correctamente",
    }


@router.delete("/{prompt_id}")
def eliminar_prompt(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    prompt_id: uuid.UUID,
):
    PromptService.delete_single_prompt(session, current_user, prompt_id)
    return {
        "status": "success",
        "message": "Imagen y prompt eliminados permanentemente del multiverso.",
    }
