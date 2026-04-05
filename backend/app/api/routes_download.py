from rq import Queue
from rq.job import Job
from rq.exceptions import NoSuchJobError
from fastapi import APIRouter, Depends, HTTPException
from app.core.redis_config import conn
from app.services.downloader import generar_zip_coleccion, ejecutar_descarga_individual
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

# 🛡️ Conectamos con la cola exacta que está escuchando worker-1
downloads_queue = Queue("downloads", connection=conn)


@router.get("/single/{image_key}")
def descargar_una_imagen(
    image_key: str, current_user: User = Depends(get_current_user)
):
    """Resolución sincrónica instantánea para archivos únicos."""
    try:
        url = ejecutar_descarga_individual(image_key)
        return {"download_url": url}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Error al generar el acceso directo en R2"
        ) @ router.get("/single/{image_key}")


def descargar_una_imagen(
    image_key: str, current_user: User = Depends(get_current_user)
):
    """Resolución sincrónica instantánea para archivos únicos."""
    try:
        url = ejecutar_descarga_individual(image_key)
        return {"download_url": url}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Error al generar el acceso directo en R2"
        )


@router.post("/collection/{collection_id}")
def descargar_coleccion_completa(
    collection_id: str, current_user: User = Depends(get_current_user)
):
    """Delega la generación masiva del ZIP al Worker de Redis para no congelar la API."""
    try:
        job = downloads_queue.enqueue(
            generar_zip_coleccion,
            collection_id,
            current_user.email,
            job_timeout="1h",  # Margen amplio para colecciones enormes
        )
        return {
            "status": "processing",
            "job_id": job.get_id(),
            "message": "Generando ZIP en segundo plano.",
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
    El frontend consulta este endpoint cada 2 segundos.
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
