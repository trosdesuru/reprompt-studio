from fastapi import APIRouter
from app.services.scraper import (
    buscar_galerias,
    obtener_enlaces_paginas,
    extraer_imagen_real,
)

router = APIRouter()


@router.get("/buscar")
def endpoint_buscar(query: str, paginas: int = 1):
    resultados = buscar_galerias(query, paginas)
    return {"status": "success", "data": resultados}


@router.get("/leer")
def endpoint_leer(url: str):
    print(f"\n⚡ [LECTOR TURBO] Obteniendo páginas de: {url}")
    paginas = obtener_enlaces_paginas(url)
    return {"status": "success", "paginas": paginas}


@router.get("/resolver_imagen")
def endpoint_resolver_imagen(url: str):
    img_real = extraer_imagen_real(url)
    if img_real:
        return {"status": "success", "url_img": img_real}
    return {"status": "error", "url_img": None}
