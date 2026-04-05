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
from app.api.deps import get_current_user, RateLimiter
from app.core.config import settings
from app.services.storage import s3_client
from app.utils.storage import eliminar_de_r2
from app.services.storage import move_to_permanent, delete_file
from app.services.security import validate_magic_bytes
from app.services.storage import s3_client

router = APIRouter()


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
    file_extension = data.filename.split(".")[-1].lower()
    if file_extension not in ["png", "jpg", "jpeg", "webp"]:
        raise HTTPException(status_code=400, detail="Extensión no permitida.")

    # 2. REGLA DE CUARENTENA: Destruimos el nombre original y forzamos la ruta /temp
    safe_filename = f"{uuid.uuid4().hex}.{file_extension}"
    s3_key = f"temp/{current_user.id}/{safe_filename}"

    try:
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.R2_BUCKET__NAME,
                "Key": s3_key,
                "ContentType": f"image/{'jpeg' if file_extension == 'jpg' else file_extension}",
            },
            ExpiresIn=300,
        )

        return {
            "status": "success",
            "upload_url": presigned_url,
            "key": s3_key,
        }
    except Exception as e:
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
        "message": "Prompt y archivo eliminados correctamente del studio",
    }
