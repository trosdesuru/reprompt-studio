import logging
import json
import asyncio
from sqlmodel import Session
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import desc, select
from app.models.gallery import GalleryMetric

from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User

from app.schemas.requests import InteractionRequest
from app.services.audit_service import AuditService
from app.services.scraper import (
    buscar_galerias,
    extraer_imagen_real,
    obtener_enlaces_paginas,
)

MAX_CONCURRENT_RESOLUTIONS = asyncio.Semaphore(10)
logger = logging.getLogger("api_search")
router = APIRouter()


@router.get("/buscar")
def endpoint_buscar(
    query: str,
    next_id: str = None,
    categories: str = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # 1. 🕵️‍♂️ Trazabilidad Limpia con el Service
    AuditService.log_action(
        session, current_user.username, "SEARCH", f"Query: {query} | Cats: {categories}"
    )
    logger.info(f"👤 Usuario {current_user.username} está buscando: {query}")

    # 2. 🧩 PROCESAR LAS CATEGORÍAS
    cats_dict = None
    if categories:
        try:
            cats_dict = json.loads(categories)
        except Exception as e:
            logger.warning(f"Error parseando categorías: {e}")
            cats_dict = None

    # 3. 🚀 LLAMAR AL SCRAPER
    try:
        res = buscar_galerias(query, next_id, cats_dict)

        # 4. 🔙 DEVOLVER LOS RESULTADOS AL FRONTEND
        return {
            "status": "success",
            "data": res.get("data", []),
            "next_id": res.get("next_id"),
        }
    except Exception as e:
        logger.error(f"💥 Error al buscar en EH: {e}")
        raise HTTPException(
            status_code=500, detail="Error al buscar galerías en el servidor."
        )


@router.get("/leer")
def endpoint_leer(
    url: str,
    p: int = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),  # 🟢 ¡Añadimos la sesión aquí también!
):
    try:
        # 🟢 Registramos la vista en la base de datos
        AuditService.log_gallery_interaction(
            session, url=url, title="Galería", thumb="", interaction_type="view"
        )

        resultado = obtener_enlaces_paginas(url, p)
        return {
            "status": "success",
            "paginas": resultado["enlaces"],
            "has_next": resultado["has_next"],
        }
    except Exception as e:
        logger.error(f"💥 Error no controlado en /leer: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar la galería.")


@router.get("/resolver-imagen")
async def endpoint_resolver_imagen(url: str):
    async with MAX_CONCURRENT_RESOLUTIONS:
        # Esto hace que si llegan 50 peticiones, 40 esperen en cola
        # y solo 10 entren al scraper a la vez.
        try:
            # Tu lógica de scraping aquí...
            # resultado = obtener_enlace_imagen_grande(url)
            # return {"status": "success", "url_img": resultado}
            pass
        except Exception as e:
            return {"status": "error", "message": str(e)}


@router.get("/tendencias")
def obtener_tendencias(limit: int = 5, session: Session = Depends(get_session)):
    """Devuelve las galerías más descargadas de la plataforma."""
    try:
        # Buscamos las métricas ordenadas por descargas (de mayor a menor)
        statement = (
            select(GalleryMetric).order_by(desc(GalleryMetric.downloads)).limit(limit)
        )
        tendencias = session.exec(statement).all()

        return {"status": "success", "data": tendencias}
    except Exception as e:
        logger.error(f"💥 Error al obtener tendencias: {e}")
        return {"status": "error", "data": []}


@router.post("/interact")
def endpoint_interact(req: InteractionRequest, session: Session = Depends(get_session)):
    """Registra una interacción (vista o descarga) con todos sus metadatos visuales"""
    AuditService.log_gallery_interaction(
        session,
        url=req.url,
        title=req.title,
        thumb=req.thumb,
        interaction_type=req.interaction_type,
    )
    return {"status": "success"}
