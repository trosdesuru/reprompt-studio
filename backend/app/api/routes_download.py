from fastapi import Depends
from app.api.deps import get_current_user
from app.models.user import User

import re

from fastapi import APIRouter

from app.core.redis_config import download_queue
from app.schemas.requests import DescargaRequest, DescargaUnaRequest
from app.services.downloader import ejecutar_descarga, ejecutar_descarga_individual
from app.utils.storage import preparar_directorio

router = APIRouter()

@router.post("/descargar")
def endpoint_descargar(req: DescargaRequest, current_user: User = Depends(get_current_user)):
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    
    # 1. Usamos nuestra utilidad para crear la carpeta
    download_dir = preparar_directorio("/storage/galleries", carpeta_limpia)
    
    # 2. Enviamos a la cola de Redis
    job = download_queue.enqueue(ejecutar_descarga, req.url, download_dir)

    return {"status": "success", "message": "Descarga enviada a la cola"}

@router.post("/descargar_imagen")
def endpoint_descargar_imagen(req: DescargaUnaRequest, current_user: User = Depends(get_current_user)):
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    
    # 1. Usamos nuestra utilidad para crear la carpeta
    download_dir = preparar_directorio("/storage/galleries", carpeta_limpia)
    
    # 2. Enviamos a la cola de Redis
    job = download_queue.enqueue(ejecutar_descarga_individual, req.url_img, download_dir, req.index)

    return {"status": "success", "message": f"Imagen {req.index} enviada a la cola"}