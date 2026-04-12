import uuid
from rq import Queue
from rq.job import Job
from rq.exceptions import NoSuchJobError
from sqlmodel import Session, select, func
from fastapi import APIRouter, Depends, HTTPException

from app.core.redis_config import conn
from app.core.db import get_session
from app.models.collection import Collection
from app.models.prompt import ImagePrompt
from app.services.downloader import generar_zip_coleccion, ejecutar_descarga_individual
from app.api.deps import get_current_user
from app.models.user import User, UserRole

router = APIRouter()

downloads_queue_premium = Queue("downloads_premium", connection=conn)
downloads_queue_free = Queue("downloads_free", connection=conn)


@router.get("/single/{image_key}")
def descargar_una_imagen(
    image_key: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Resolución sincrónica instantánea para archivos únicos."""

    statement = select(ImagePrompt).where(ImagePrompt.image_url.contains(image_key))
    prompt = session.exec(statement).first()

    if not prompt:
        raise HTTPException(
            status_code=404, detail="Imagen no encontrada en la base de datos."
        )

    if prompt.collection_id:
        col = session.get(Collection, prompt.collection_id)
        if col and col.is_private and col.user_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="No tienes permiso. Esta imagen es privada."
            )

    try:
        url = ejecutar_descarga_individual(image_key)
        return {"download_url": url}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Error al generar el acceso directo en R2"
        )


@router.post("/collection/{collection_id}")
def descargar_coleccion_completa(
    collection_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delega la generación masiva del ZIP al Worker de Redis para no congelar la API."""

    col = session.get(Collection, collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Colección no encontrada")

    if col.is_private and col.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Esta colección es privada")

    cantidad_imagenes = session.exec(
        select(func.count(ImagePrompt.id)).where(
            ImagePrompt.collection_id == collection_id
        )
    ).one()

    limite_descarga = 50 if current_user.role == UserRole.VOYAGER else 1000

    if cantidad_imagenes > limite_descarga:
        raise HTTPException(
            status_code=403,
            detail=f"Tu plan '{current_user.role}' permite descargar un máximo de {limite_descarga} imágenes de golpe. Esta colección tiene {cantidad_imagenes}. ¡Haz upgrade a Artist!",
        )

    try:
        if current_user.role == UserRole.ARTIST:
            job = downloads_queue_premium.enqueue(
                generar_zip_coleccion,
                str(collection_id),
                current_user.email,
                job_timeout="1h",
            )
            queue_assigned = "premium"
        else:
            job = downloads_queue_free.enqueue(
                generar_zip_coleccion,
                str(collection_id),
                current_user.email,
                job_timeout="1h",
            )
            queue_assigned = "free"

        return {
            "status": "processing",
            "job_id": job.get_id(),
            "message": "Generando ZIP en segundo plano.",
            "queue": queue_assigned,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Error al encolar la descarga masiva"
        )


@router.get("/status/{job_id}")
def verificar_estado_descarga(
    job_id: str, current_user: User = Depends(get_current_user)
):
    """
    El frontend consulta este endpoint cada X segundos.
    Lee directamente de Redis el estado del Worker sin tocar la Base de Datos.
    """
    try:
        job = Job.fetch(job_id, connection=conn)

        if job.is_finished:
            return {"status": "finished", "download_url": job.result}
        elif job.is_failed:
            return {"status": "failed", "error": str(job.exc_info)}
        else:
            return {"status": "processing"}

    except NoSuchJobError:
        raise HTTPException(
            status_code=404, detail="El trabajo de descarga no existe o ha caducado"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al consultar Redis")
