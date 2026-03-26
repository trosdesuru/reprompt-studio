import re
from bs4 import BeautifulSoup
from urllib.parse import quote
from app.core.config import http_session

def buscar_galerias(query: str, paginas: int = 1):
    resultados = []
    url_base = f"https://e-hentai.org/?f_search={quote(query)}"

    for p in range(paginas):
        r = http_session.get(f"{url_base}&page={p}")
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
            
    return resultados

def obtener_enlaces_paginas(url: str):
    paginas = []
    try:
        r = http_session.get(url, timeout=10)
        soup = BeautifulSoup(r.text, "lxml")
        enlaces = soup.select('#gdt a[href*="/s/"], .itg a[href*="/s/"]')
        for a in enlaces:
            href = a.get("href")
            if href: paginas.append(href)
    except Exception as e:
        print(f"⚠️ Error crítico al leer la galería: {e}")
        
    return list(dict.fromkeys(paginas))

def extraer_imagen_real(url: str):
    try:
        r = http_session.get(url, timeout=5)
        match = re.search(r'<img id="img" src="(.*?)"', r.text)
        if match:
            return match.group(1)
    except:
        pass
    return None