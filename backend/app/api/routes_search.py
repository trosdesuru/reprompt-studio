# backend/app/api/routes_search.py
import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, Depends, Body
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
    cats_dict = json.loads(categories) if categories else None
    res = scraper.buscar_galerias(query, next_id, cats_dict)
    return {
        "status": "success",
        "data": res.get("data", []),
        "next_id": res.get("next_id"),
    }


@router.get("/tendencias")
def obtener_tendencias(limit: int = 5, session: Session = Depends(get_session)):
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
            "data": res.get("enlaces", []),
            "has_next": res.get("has_next", False),
        }
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}


# 🟢 FIX 1: Cambiamos el guion medio por guion bajo para que coincida con el Frontend
@router.get("/resolver_imagen")
def resolver_imagen(url: str):
    try:
        res = scraper.extraer_imagen_real(url)
        return {"status": "success", "url_img": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# 🟢 FIX 2: Añadimos `= Body(...)` para que FastAPI entienda el JSON y evite el 422
@router.post("/interact")
def registrar_interaccion(
    data: dict = Body(...), session: Session = Depends(get_session)
):
    try:
        url = data.get("url")
        title = data.get("title", "Sin título")
        i_type = data.get("type") or data.get("interaction_type") or "view"

        if not url:
            return {"status": "error", "message": "Falta la URL"}

        statement = select(GalleryMetric).where(GalleryMetric.url == url)
        metric = session.exec(statement).first()

        if not metric:
            metric = GalleryMetric(url=url, title=title, views=0, downloads=0)
            session.add(metric)

        if i_type == "view":
            metric.views += 1
        elif i_type == "download":
            metric.downloads += 1

        session.commit()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
