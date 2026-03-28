# backend/app/services/scraper.py
import logging
import re
import json
import redis
from urllib.parse import quote
from bs4 import BeautifulSoup
from app.core.config import http_session

logger = logging.getLogger("scraper")

# 🟢 CONFIGURACIÓN DE REDIS PARA CACHÉ
# Usamos decode_responses=True para que devuelva strings en lugar de bytes
try:
    redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
except Exception as e:
    logger.error(f"⚠️ No se pudo conectar a Redis para Caché: {e}")
    redis_client = None


def limpiar_titulo(titulo_crudo: str) -> str:
    """Limpia el ruido de los títulos de E-Hentai mediante Regex."""
    titulo_limpio = re.sub(r"\[.*?\]|\(.*?\)|<.*?>|\{.*?\}", "", titulo_crudo)
    titulo_limpio = re.sub(r"[-~|,_]+", " ", titulo_limpio)
    titulo_limpio = re.sub(r"\s+", " ", titulo_limpio).strip()

    if len(titulo_limpio) < 3:
        return titulo_crudo.strip()
    return titulo_limpio


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
    if categories_json:
        for cat, is_active in categories_json.items():
            if not is_active:
                f_cats += mapping.get(cat, 0)
    return f_cats


# ==========================================
# 🚀 1. CACHÉ DE BÚSQUEDA (TTL: 15 Minutos)
# ==========================================
def buscar_galerias(query: str, next_id: str = None, categories: dict = None):
    f_cats = calcular_f_cats(categories)

    # Generamos una clave única basada en lo que el usuario ha pedido
    cache_key = f"cache:search:q={query}:next={next_id}:cats={f_cats}"

    # Intentamos recuperar de la Caché primero
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                logger.info(
                    f"⚡ [CACHE HIT] Resultados de búsqueda devueltos desde Redis (0.01s)"
                )
                return json.loads(cached_result)
        except Exception:
            pass

    url = f"https://e-hentai.org/?f_search={quote(query)}&f_cats={f_cats}"
    if next_id:
        url += f"&next={next_id}"

    logger.info(f"📡 [SCRAPING] Consultando a E-Hentai: {url}")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
    }
    cookies = {"nw": "1"}

    try:
        r = http_session.get(url, headers=headers, cookies=cookies, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        next_tag = soup.find("a", id="unext")
        found_next_id = (
            next_tag["href"].split("next=")[1]
            if next_tag and "next=" in next_tag["href"]
            else None
        )

        tarjetas = soup.select(".itg tr, .itg .gl1t")
        resultados = []
        for tarjeta in tarjetas:
            enlace = tarjeta.select_one("a[href*='/g/']")
            if enlace:
                img_tag = tarjeta.select_one("img")
                thumb = img_tag.get("data-src") or img_tag.get("src") or ""
                titulo_crudo = enlace.text.strip()

                resultados.append(
                    {
                        "url": enlace["href"],
                        "thumb": thumb,
                        "title": limpiar_titulo(titulo_crudo),
                        "title_raw": titulo_crudo,
                    }
                )

        final_result = {"data": resultados, "next_id": found_next_id}

        # Guardamos en Caché durante 15 minutos (900 segundos)
        if redis_client:
            try:
                redis_client.setex(cache_key, 900, json.dumps(final_result))
            except Exception:
                pass

        return final_result

    except Exception as e:
        logger.error(f"💥 [ERROR SCRAPING]: {e}")
        return {"data": [], "next_id": None}


# ==========================================
# 🚀 2. CACHÉ DE GALERÍA (TTL: 24 Horas)
# ==========================================
def obtener_enlaces_paginas(url: str, pagina: int = 0):
    cache_key = f"cache:gallery:{url}:p={pagina}"

    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                logger.info(
                    f"⚡ [CACHE HIT] Página {pagina} de galería devuelta desde Redis"
                )
                return json.loads(cached_result)
        except Exception:
            pass

    paginas_lista = []
    logger.info(f"📡 [SCRAPING] Extrayendo página {pagina} de {url}")

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

            thumb_url, offset, width, height = "", "", None, None

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
                        "width": width,
                        "height": height,
                    }
                )

        has_next = any(">" in a.text for a in soup.select(".ptt a"))

        final_result = {"enlaces": paginas_lista, "has_next": has_next}

        # Guardamos en Caché durante 24 horas (86400 segundos). El contenido de una galería no cambia.
        if redis_client:
            try:
                redis_client.setex(cache_key, 86400, json.dumps(final_result))
            except Exception:
                pass

        return final_result

    except Exception as e:
        logger.error(f"💥 Error crítico en scraper: {str(e)}")
        return {"enlaces": [], "has_next": False}


# ==========================================
# 🚀 3. CACHÉ DE RESOLUCIÓN FULL HD (TTL: 2 Horas)
# ==========================================
def extraer_imagen_real(url_visor: str):
    cache_key = f"cache:image_res:{url_visor}"

    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return cached_result  # Es un string directo
        except Exception:
            pass

    logger.info(f"📡 [SCRAPING] Resolviendo imagen real: {url_visor}")
    try:
        cookies = {"nw": "1"}
        r = http_session.get(url_visor, cookies=cookies, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        img_tag = soup.find("img", id="img")

        if not img_tag:
            return None

        real_url = img_tag.get("src")

        # Guardamos la URL resuelta por 2 horas (Las claves de imagen de EHentai suelen expirar)
        if redis_client and real_url:
            try:
                redis_client.setex(cache_key, 7200, real_url)
            except Exception:
                pass

        return real_url
    except Exception as e:
        logger.error(f"Error extrayendo imagen {url_visor}: {e}")
        return None
