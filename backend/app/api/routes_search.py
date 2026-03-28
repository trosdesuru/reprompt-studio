# backend/app/api/routes_search.py
import json
from fastapi import APIRouter, Query, Depends
from typing import Optional
from sqlmodel import Session, select
from app.services import scraper
from app.core.db import get_session
from app.models.gallery import GalleryMetric

router = APIRouter()


@router.get("/buscar")
def buscar(
    query: str = Query(""),
    next_id: Optional[str] = None,
    categories: Optional[str] = None,
):
    """Búsqueda optimizada. Incluimos 'status: success' para que Zustand lo acepte."""
    cats_dict = json.loads(categories) if categories else None
    res = scraper.buscar_galerias(query, next_id, cats_dict)

    # 🟢 FIX: Garantizamos el contrato de datos del Frontend
    return {
        "status": "success",
        "data": res.get("data", []),
        "next_id": res.get("next_id"),
    }


@router.get("/tendencias")
def obtener_tendencias(limit: int = 5, session: Session = Depends(get_session)):
    """🟢 FIX: Restauramos el endpoint perdido de Tendencias"""
    try:
        statement = (
            select(GalleryMetric)
            .order_by(GalleryMetric.downloads.desc(), GalleryMetric.views.desc())
            .limit(limit)
        )
        results = session.exec(statement).all()
        data = [
            {
                "url": r.url,
                "title": r.title,
                "thumb": r.thumb,
                "downloads": r.downloads,
                "views": r.views,
            }
            for r in results
        ]
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}


@router.get("/leer")
def leer_galeria(url: str, p: int = 0):
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
    try:
        res = scraper.extraer_imagen_real(url)
        return {"status": "success", "url_img": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}
