# backend/app/services/scraper.py
import logging
import re
from urllib.parse import quote
from bs4 import BeautifulSoup
from app.core.config import http_session

logger = logging.getLogger("scraper")


def limpiar_titulo(titulo_crudo: str) -> dict:
    """Limpia el ruido de los títulos de E-Hentai extrayendo la info útil."""

    # 1. Extraemos todo lo que está entre corchetes o paréntesis (Tags, Grupos, Idiomas)
    matches = re.findall(r"\[(.*?)\]|\((.*?)\)", titulo_crudo)
    tags_extracted = [tag for tupla in matches for tag in tupla if tag.strip()]

    # 2. Eliminamos todo el contenido entre paréntesis, corchetes o llaves
    titulo_limpio = re.sub(r"\[.*?\]|\(.*?\)|<.*?>|\{.*?\}", "", titulo_crudo)

    # 3. Limpiamos caracteres huérfanos (guiones, tildes, barras) que queden sueltos
    titulo_limpio = re.sub(r"[-~|,_]+", " ", titulo_limpio)

    # 4. Comprimimos los espacios dobles/triples que hayan quedado y quitamos espacios en los bordes
    titulo_limpio = re.sub(r"\s+", " ", titulo_limpio).strip()

    # 5. PROGRAMACIÓN DEFENSIVA (Fallback)
    # Si el título era TAN raro que al limpiarlo se ha quedado en nada, usamos el original
    if len(titulo_limpio) < 3:
        titulo_limpio = titulo_crudo.strip()

    return {
        "title_clean": titulo_limpio,
        "title_raw": titulo_crudo.strip(),
        "tags_extracted": tags_extracted,
    }


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
    paginas_lista = []
    logger.info(f"⚡ Lector Turbo: Extrayendo página {pagina} de {url}")

    try:
        cookies = {"nw": "1", "uconfig": "ts_l"}
        r = http_session.get(f"{url}?p={pagina}", cookies=cookies, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        enlaces = soup.select('a[href*="/s/"]')

        for a in enlaces:
            href = a.get("href")
            if not href:
                continue

            thumb_url = ""
            offset = ""
            width = None  # 🟢 Capturaremos el ancho dinámico
            height = None  # 🟢 Capturaremos el alto dinámico

            img = a.find("img")
            if img:
                thumb_url = img.get("data-src") or img.get("src", "")
                if "t.gif" in thumb_url:
                    thumb_url = ""

            if not thumb_url:
                parent = a.parent
                div_style = a.find("div", style=True) or (
                    parent
                    if parent and parent.name == "div" and parent.get("style")
                    else None
                )
                if div_style:
                    style_text = div_style.get("style", "")

                    match_url = re.search(r"url\((.*?)\)", style_text)
                    if match_url:
                        thumb_url = match_url.group(1).strip("'\"")

                    match_offset = re.search(
                        r"url\(.*?\)\s+([-0-9a-zA-Z]+)\s+([-0-9a-zA-Z]+)", style_text
                    )
                    if match_offset:
                        offset = f"{match_offset.group(1)} {match_offset.group(2)}"

                    # 🟢 FIX DINÁMICO: Extraemos width y height del estilo
                    match_w = re.search(r"width:\s*(\d+)px", style_text)
                    match_h = re.search(r"height:\s*(\d+)px", style_text)
                    if match_w:
                        width = int(match_w.group(1))
                    if match_h:
                        height = int(match_h.group(1))

            if not any(p["page_url"] == href for p in paginas_lista):
                paginas_lista.append(
                    {
                        "page_url": href,
                        "thumb_url": thumb_url,
                        "offset": offset,
                        "width": width,  # 🟢 Se lo pasamos al frontend
                        "height": height,  # 🟢 Se lo pasamos al frontend
                    }
                )

        has_next = False
        next_buttons = soup.select(".ptt a")
        if next_buttons and ">" in next_buttons[-1].text:
            has_next = True

        return {"enlaces": paginas_lista, "has_next": has_next}

    except Exception as e:
        logger.error(f"💥 Error crítico en scraper: {str(e)}")
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
