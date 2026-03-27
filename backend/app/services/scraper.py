# backend/app/services/scraper.py
import logging
import re
import time
from urllib.parse import quote
from bs4 import BeautifulSoup
from app.core.config import http_session

logger = logging.getLogger("scraper")


def calcular_f_cats(categories_json: dict):
    # Valores de exclusión oficiales
    mapping = {
        "misc": 1,
        "doujinshi": 2,
        "manga": 4,
        "artistcg": 8,
        "gamecg": 16,
        "imageset": 32,
        "cosplay": 64,
        "asianporn": 128,
        "nonh": 256,
        "western": 512,
    }
    f_cats = 0
    # EH funciona por EXCLUSIÓN: si la categoría NO está activa, sumamos su valor
    for cat, is_active in categories_json.items():
        if not is_active:
            f_cats += mapping.get(cat, 0)
    return f_cats


def buscar_galerias(query: str, next_id: str = None, categories: dict = None):
    # 1. Calculamos el f_cats si nos envían el JSON de categorías
    f_cats = calcular_f_cats(categories) if categories else 0

    # 2. Construimos la URL con el filtro
    url = f"https://e-hentai.org/?f_search={quote(query)}&f_cats={f_cats}"
    if next_id:
        url += f"&next={next_id}"

    logger.info(f"📡 [SOLICITUD] {url}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
    }
    cookies = {"nw": "1"}

    try:
        r = http_session.get(url, headers=headers, cookies=cookies, timeout=10)
        soup = BeautifulSoup(r.text, "lxml")

        # 🟢 BUSCAR EL PUNTERO SIGUIENTE (Lo que tú inspeccionaste)
        next_tag = soup.find("a", id="unext")
        found_next_id = None
        if next_tag and "next=" in next_tag["href"]:
            # Extraemos solo el número después de 'next='
            found_next_id = next_tag["href"].split("next=")[1]
            logger.info(f"⏭️ [SIGUIENTE ID DETECTADO]: {found_next_id}")

        tarjetas = soup.select(".itg tr, .itg .gl1t")
        resultados = []
        for tarjeta in tarjetas:
            enlace = tarjeta.select_one("a[href*='/g/']")
            if enlace:
                img_tag = tarjeta.select_one("img")
                thumb = img_tag.get("data-src") or img_tag.get("src") or ""
                resultados.append(
                    {
                        "url": enlace["href"],
                        "thumb": thumb,
                        "title": enlace.text.strip(),
                    }
                )

        return {"data": resultados, "next_id": found_next_id}

    except Exception as e:
        logger.error(f"💥 [ERROR]: {e}")
        return {"data": [], "next_id": None}


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
        logger.debug(f"⚠️ No se pudo extraer imagen de {url}: {e}")
    return None
