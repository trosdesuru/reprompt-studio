from fastapi import APIRouter
from app.schemas.requests import DescargaRequest
from app.core.redis_config import download_queue
from app.services.downloader import ejecutar_descarga
import os
import re

router = APIRouter()

@router.post("/descargar")
def endpoint_descargar(req: DescargaRequest):
    # 1. Limpiamos el nombre de la carpeta
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    download_dir = f"/storage/galleries/{carpeta_limpia}"
    
    # 2. ENVIAR A LA PIZARRA (Redis)
    # Esto le dice a Redis: "Ejecuta 'ejecutar_descarga' con estos argumentos"
    job = download_queue.enqueue(
        ejecutar_descarga, 
        req.url, 
        download_dir
    )

    return {
        "status": "success", 
        "message": "Descarga enviada a la cola",
        "job_id": job.get_id() # ID del ticket por si queremos rastrearlo
    }