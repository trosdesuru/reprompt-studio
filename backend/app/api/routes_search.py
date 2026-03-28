# backend/app/api/routes_search.py
import json
from fastapi import APIRouter, Query
from typing import Optional
from app.services import scraper

router = APIRouter()


@router.get("/buscar")
def buscar(
    query: str = Query(""),
    next_id: Optional[str] = None,
    categories: Optional[str] = None,
):
    """Búsqueda optimizada en Threadpool"""
    cats_dict = json.loads(categories) if categories else None
    return scraper.buscar_galerias(query, next_id, cats_dict)


@router.get("/leer")
def leer_galeria(url: str, p: int = 0):
    """Carga de miniaturas en Threadpool (Evita el bloqueo de los Skeletons)"""
    try:
        res = scraper.obtener_enlaces_paginas(url, p)
        return {
            "status": "success",
            "paginas": res.get("enlaces", []),
            "has_next": res.get("has_next", False),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/resolver-imagen")
def resolver_imagen(url: str):
    """Resolución de imagen Full HD en Threadpool (Evita saturar la RAM)"""
    try:
        res = scraper.extraer_imagen_real(url)
        return {"status": "success", "url_img": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}
