# backend/app/api/routes_search.py
import logging
import json
from sqlmodel import Session
from app.core.db import get_session
from app.models.user import User, AuditLog
from fastapi import APIRouter, HTTPException
from fastapi import Depends
from app.api.deps import get_current_user

from app.services.scraper import (
    extraer_imagen_real,
    obtener_enlaces_paginas,
)


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

    log = AuditLog(
        username=current_user.username,
        action="SEARCH",
        details=f"Query: {query} | Cats: {categories}",
    )
    session.add(log)
    session.commit()

    logger.info(f"👤 Usuario {current_user.username} está buscando: {query}")


@router.get("/leer")
def endpoint_leer(url: str, p: int = 0, current_user: User = Depends(get_current_user)):
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
def endpoint_resolver_imagen(url: str, current_user: User = Depends(get_current_user)):
    img_real = extraer_imagen_real(url)
    if img_real:
        return {"status": "success", "url_img": img_real}
    return {"status": "error", "url_img": None}
