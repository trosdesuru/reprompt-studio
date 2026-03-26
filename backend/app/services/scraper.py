# backend/app/services/scraper.py
import re
import logging
from bs4 import BeautifulSoup
from urllib.parse import quote
from app.core.config import http_session

logger = logging.getLogger("scraper")

def buscar_galerias(query: str, paginas: int = 1):
    resultados = []
    url_base = f"https://e-hentai.org/?f_search={quote(query)}"
    logger.info(f"🔍 Buscando '{query}' ({paginas} páginas)")

    for p in range(paginas):
        try:
            r = http_session.get(f"{url_base}&page={p}", timeout=10)
            r.raise_for_status() # Lanza error automático si la web responde 404, 500, 503...
            soup = BeautifulSoup(r.text, "lxml")

            tarjetas = soup.select(".itg tr, .itg .gl1t")
            for tarjeta in tarjetas:
                enlace = tarjeta.select_one("a[href*='/g/']")
                if not enlace: continue

                link = enlace["href"]
                titulo = enlace.text.strip()
                
                img_tag = tarjeta.select_one("img")
                thumb = img_tag.get("data-src") or img_tag.get("src") if img_tag else "N/A"

                resultados.append({"url": link, "thumb": thumb, "title": titulo})
        except Exception as e:
            logger.error(f"❌ Error escaneando página {p} de la búsqueda: {e}")
            
    return resultados


def obtener_enlaces_paginas(url: str):
    paginas = []
    logger.info(f"⚡ Extrayendo páginas de Lector Turbo: {url}")
    try:
        r = http_session.get(url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        
        enlaces = soup.select('#gdt a[href*="/s/"], .itg a[href*="/s/"]')
        for a in enlaces:
            href = a.get("href")
            if href: paginas.append(href)
    except Exception as e:
        logger.error(f"⚠️ Error crítico al leer la galería: {e}")
        
    return list(dict.fromkeys(paginas))


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