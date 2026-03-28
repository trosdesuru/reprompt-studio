# backend/app/services/scraper.py
import logging
import re
import time
from urllib.parse import quote
from bs4 import BeautifulSoup
from app.core.config import http_session

logger = logging.getLogger("scraper")


def calcular_f_cats(categories_json: dict):
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
    for cat, is_active in categories_json.items():
        if not is_active:
            f_cats += mapping.get(cat, 0)
    return f_cats


def buscar_galerias(query: str, next_id: str = None, categories: dict = None):
    f_cats = calcular_f_cats(categories) if categories else 0
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
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        next_tag = soup.find("a", id="unext")
        found_next_id = None
        if next_tag and "next=" in next_tag["href"]:
            found_next_id = next_tag["href"].split("next=")[1]

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
    """Extrae la página y sus miniaturas. Cambiamos 'enlaces' por 'paginas' para el Frontend."""
    paginas_dict = {}
    try:
        r = http_session.get(f"{url}?p={pagina}", timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        # Selector de celdas (Grid o Tabla)
        celdas = soup.select("#gdt .gdtm, #gdt .gdtl, .itg td")

        for celda in celdas:
            a = celda.find("a", href=True)
            if not a or "/s/" not in a["href"]:
                continue

            href = a["href"]
            thumb_url = ""

            # Buscamos miniatura en img o en style (background-url)
            img = celda.find("img")
            if img:
                thumb_url = img.get("data-src") or img.get("src")

            if not thumb_url:
                div_style = celda.find("div", style=True)
                if div_style:
                    match = re.search(r"url\((.*?)\)", div_style["style"])
                    if match:
                        thumb_url = match.group(1).strip("'\"")

            if href not in paginas_dict:
                paginas_dict[href] = {"page_url": href, "thumb_url": thumb_url}

        has_next = False
        for a in soup.select(".ptt a"):
            if ">" in a.text:
                has_next = True
                break

        # 🟢 CAMBIO CRÍTICO: Devolvemos 'paginas' en lugar de 'enlaces'
        return {
            "status": "success",
            "paginas": list(paginas_dict.values()),
            "has_next": has_next,
        }
    except Exception as e:
        logger.error(f"Error en scraper: {e}")
        return {"status": "error", "paginas": [], "has_next": False}


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
