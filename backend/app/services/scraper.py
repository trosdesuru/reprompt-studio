# backend/app/services/scraper.py
import logging
import re
from urllib.parse import quote

from bs4 import BeautifulSoup

from app.core.config import http_session

logger = logging.getLogger("scraper")


import concurrent.futures  # <-- AÑADE ESTO ARRIBA CON LOS IMPORTS


def buscar_galerias(query: str, paginas: int = 1):
    resultados = []
    url_base = f"https://e-hentai.org/?f_search={quote(query)}"
    logger.info(f"🔍 Buscando '{query}' ({paginas} páginas en PARALELO 🚀)")

    def fetch_page(p):
        """Función aislada que procesa una sola página"""
        try:
            r = http_session.get(f"{url_base}&page={p}", timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "lxml")

            page_results = []
            for tarjeta in soup.select(".itg tr, .itg .gl1t"):
                enlace = tarjeta.select_one("a[href*='/g/']")
                if not enlace:
                    continue

                img_tag = tarjeta.select_one("img")
                thumb = (
                    img_tag.get("data-src") or img_tag.get("src") if img_tag else "N/A"
                )
                page_results.append(
                    {
                        "url": enlace["href"],
                        "thumb": thumb,
                        "title": enlace.text.strip(),
                    }
                )
            return page_results
        except Exception as e:
            logger.error(f"❌ Error escaneando página {p}: {e}")
            return []

    # Lanzamos hasta 5 peticiones simultáneas (¡Magia negra de Python!)
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for res in executor.map(fetch_page, range(paginas)):
            resultados.extend(res)

    return resultados


def obtener_enlaces_paginas(url: str, pagina: int = 0):
    """Extrae SOLO una página y avisa si hay más."""
    paginas = []
    logger.info(f"⚡ Lector Turbo: Extrayendo página {pagina} de {url}")

    try:
        r = http_session.get(f"{url}?p={pagina}", timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        enlaces = soup.select('#gdt a[href*="/s/"], .itg a[href*="/s/"]')
        for a in enlaces:
            href = a.get("href")
            if href:
                paginas.append(href)

        # Detectamos si existe la flecha de "Siguiente" en la tabla de paginación
        has_next = False
        for a in soup.select(".ptt a"):
            if ">" in a.text:
                has_next = True
                break

        return {"enlaces": list(dict.fromkeys(paginas)), "has_next": has_next}
    except Exception as e:
        logger.error(f"⚠️ Error al leer la galería (pág {pagina}): {e}")
        return {"enlaces": [], "has_next": False}


def extraer_imagen_real(url: str):
    try:
        r = http_session.get(url, timeout=5)
        r.raise_for_status()
        match = re.search(r'<img id="img" src="(.*?)"', r.text)
        if match:
            return match.group(1)
    except Exception as e:
        # Fallamos silenciosamente a nivel de usuario, pero el dev se entera en los logs
        logger.debug(f"⚠️ No se pudo extraer imagen de {url}: {e}")
    return None
