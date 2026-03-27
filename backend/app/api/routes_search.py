# backend/app/api/routes_search.py
import logging
import json
from fastapi import APIRouter, HTTPException
from app.services.scraper import buscar_galerias

from app.services.scraper import (
    buscar_galerias,
    extraer_imagen_real,
    obtener_enlaces_paginas,
)


logger = logging.getLogger("api_search")
router = APIRouter()


@router.get("/buscar")
def endpoint_buscar(query: str, next_id: str = None, categories: str = None):
    # 🟢 Convertimos el string JSON de vuelta a un diccionario de Python
    cats_dict = None
    if categories:
        try:
            cats_dict = json.loads(categories)
        except:
            cats_dict = None

    res = buscar_galerias(query, next_id, cats_dict)
    return {"status": "success", "data": res["data"], "next_id": res["next_id"]}


@router.get("/leer")
def endpoint_leer(url: str, p: int = 0):
    try:
        resultado = obtener_enlaces_paginas(url, p)
        return {
            "status": "success",
            "paginas": resultado["enlaces"],
            "has_next": resultado["has_next"],
        }
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
