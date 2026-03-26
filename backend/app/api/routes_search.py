# backend/app/api/routes_search.py
import logging
from fastapi import APIRouter, HTTPException
from app.services.scraper import (
    buscar_galerias,
    obtener_enlaces_paginas,
    extraer_imagen_real,
)

logger = logging.getLogger("api_search")
router = APIRouter()

@router.get("/buscar")
def endpoint_buscar(query: str, paginas: int = 1):
    try:
        resultados = buscar_galerias(query, paginas)
        return {"status": "success", "data": resultados}
    except Exception as e:
        logger.error(f"💥 Error no controlado en /buscar: {e}")
        raise HTTPException(status_code=500, detail="Error interno al buscar galerías.")


@router.get("/leer")
def endpoint_leer(url: str):
    try:
        paginas = obtener_enlaces_paginas(url)
        return {"status": "success", "paginas": paginas}
    except Exception as e:
        logger.error(f"💥 Error no controlado en /leer: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar la galería.")


@router.get("/resolver_imagen")
def endpoint_resolver_imagen(url: str):
    img_real = extraer_imagen_real(url)
    if img_real:
        return {"status": "success", "url_img": img_real}
    # Mantengo el return 200 con status "error" para no romper tu frontend de React
    return {"status": "error", "url_img": None}