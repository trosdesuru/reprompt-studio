# backend/app/api/routes_search.py
import logging
import json
from sqlmodel import Session
from fastapi import APIRouter, HTTPException, Depends

from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User, AuditLog

# 🟢 IMPORTANTE: Faltaba importar buscar_galerias
from app.services.scraper import (
    buscar_galerias,
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
    # 1. 🕵️‍♂️ GUARDAR EL LOG EN LA BASE DE DATOS
    log = AuditLog(
        username=current_user.username,
        action="SEARCH",
        details=f"Query: {query} | Cats: {categories}",
    )
    session.add(log)
    session.commit()

    logger.info(f"👤 Usuario {current_user.username} está buscando: {query}")

    # 2. 🧩 PROCESAR LAS CATEGORÍAS
    cats_dict = None
    if categories:
        try:
            cats_dict = json.loads(categories)
        except Exception as e:
            logger.warning(f"Error parseando categorías: {e}")
            cats_dict = None

    # 3. 🚀 LLAMAR AL SCRAPER (Esto es lo que había desaparecido)
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
