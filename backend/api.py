import os
import re
import time
import requests
from bs4 import BeautifulSoup  # 👈 NUEVO IMPORT
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# (Mantén los imports de Selenium porque los seguimos usando para descargar galerías enteras en segundo plano)
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import quote

# 🔥 LA SESIÓN GLOBAL MÁGICA 🔥
# Esto mantiene la conexión abierta con E-Hentai y ahorra cientos de milisegundos por foto.
http_session = requests.Session()
http_session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Cookie": "nw=1",  # 👈 El bypass del +18 inyectado de serie en todas las peticiones
    }
)

app = FastAPI(title="Galeria Scraper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DescargaRequest(BaseModel):
    url: str
    title: str


class DescargaUnaRequest(BaseModel):
    url_img: str
    title: str
    index: int


# --- FUNCIONES DE DESCARGA EN SEGUNDO PLANO ---
def ejecutar_descarga(url: str, carpeta_destino: str):
    print(f"\n📥 [DESCARGA TOTAL] Iniciando: {carpeta_destino}")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("user-agent=Mozilla/5.0")
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 10)
    try:
        driver.get(url)
        driver.add_cookie({"name": "nw", "value": "1", "domain": ".e-hentai.org"})
        driver.refresh()
        img_count = 1
        while True:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#gdt, .itg")))
            thumbs = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/s/"]')
            links = list(
                dict.fromkeys(
                    [t.get_attribute("href") for t in thumbs if t.get_attribute("href")]
                )
            )

            for link in links:
                driver.get(link)
                try:
                    img_element = wait.until(
                        EC.presence_of_element_located((By.ID, "img"))
                    )
                    src = img_element.get_attribute("src")
                    headers = {
                        "User-Agent": "Mozilla/5.0",
                        "Referer": driver.current_url,
                    }
                    r = requests.get(src, headers=headers, stream=True, timeout=10)
                    if r.status_code == 200:
                        ext = src.split(".")[-1].split("?")[0]
                        if len(ext) > 4:
                            ext = "jpg"
                        path = os.path.join(
                            carpeta_destino, f"image_{img_count:03d}.{ext}"
                        )
                        with open(path, "wb") as f:
                            for chunk in r.iter_content(1024):
                                f.write(chunk)
                        print(f"   └─ 🖼️ [{img_count:03d}] Guardada en alta res")
                        img_count += 1
                        time.sleep(1)
                except Exception:
                    print(f"   └─ ❌ Error bajando imagen.")
                driver.back()

            try:
                next_button = driver.find_element(By.XPATH, "//a[text()='>']")
                next_button.click()
                time.sleep(2)
            except:
                print(f"✨ [DESCARGA TOTAL] Completada")
                break
    finally:
        driver.quit()


def ejecutar_descarga_individual(url_img: str, carpeta_destino: str, indice: int):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url_img, headers=headers, stream=True, timeout=10)
        if r.status_code == 200:
            ext = url_img.split(".")[-1].split("?")[0]
            if len(ext) > 4:
                ext = "jpg"
            path = os.path.join(carpeta_destino, f"image_{indice:03d}.{ext}")
            with open(path, "wb") as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
            print(f"✅ Imagen {indice} guardada.")
    except Exception as e:
        print(f"❌ Error: {e}")


# --- ENDPOINTS ---
@app.get("/api/buscar")
def buscar_galerias_rapido(query: str, paginas: int = 1):
    resultados = []
    # Usamos una Sesión para mantener la conexión viva y que sea más rápido
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0", "Cookie": "nw=1"})

    url_base = f"https://e-hentai.org/?f_search={quote(query)}"

    for p in range(paginas):
        # Esto tarda ~0.3 segundos frente a los ~3 segundos de Selenium
        r = session.get(f"{url_base}&page={p}")
        soup = BeautifulSoup(r.text, "lxml")  # 'lxml' es el motor más rápido

        tarjetas = soup.select(".itg tr, .itg .gl1t")
        for tarjeta in tarjetas:
            enlace = tarjeta.select_one("a[href*='/g/']")
            if not enlace:
                continue

            link = enlace["href"]
            titulo = enlace.text.strip()

            # Buscamos la imagen
            img_tag = tarjeta.select_one("img")
            thumb = img_tag.get("data-src") or img_tag.get("src") if img_tag else "N/A"

            resultados.append({"url": link, "thumb": thumb, "title": titulo})

    return {"status": "success", "data": resultados}


@app.get("/api/leer")
def leer_galeria(url: str):
    """Extrae los enlaces de las PÁGINAS del cómic en milisegundos usando BeautifulSoup"""
    print(f"\n⚡ [LECTOR TURBO] Obteniendo páginas de: {url}")
    paginas = []

    try:
        # Hacemos la petición con la sesión global (ya lleva la cookie nw=1)
        r = http_session.get(url, timeout=10)

        # Parseamos el HTML crudo
        soup = BeautifulSoup(r.text, "lxml")

        # Selectores CSS súper rápidos para atrapar los enlaces de lectura (/s/...)
        enlaces = soup.select('#gdt a[href*="/s/"], .itg a[href*="/s/"]')

        for a in enlaces:
            href = a.get("href")
            if href:
                paginas.append(href)

    except Exception as e:
        print(f"⚠️ Error crítico al leer la galería: {e}")

    enlaces_unicos = list(dict.fromkeys(paginas))
    print(f"✅ ¡Éxito! Se extrajeron {len(enlaces_unicos)} enlaces en tiempo récord.")

    return {"status": "success", "paginas": enlaces_unicos}


@app.get("/api/resolver_imagen")
def resolver_imagen(url: str):
    """Micro-servicio ultrarrápido: recibe una página /s/ y devuelve el .jpg real"""
    try:
        # Usamos la sesión global (reutiliza la conexión SSL = velocidad extrema)
        r = http_session.get(url, timeout=5)

        # En lugar de parsear todo el HTML, usamos Regex para pescar la URL exacta
        # Esto es literalmente la forma más rápida posible de extraer un dato en Python
        match = re.search(r'<img id="img" src="(.*?)"', r.text)

        if match:
            return {"status": "success", "url_img": match.group(1)}

    except Exception as e:
        # Si falla (ej: timeout), fallamos silenciosamente para no bloquear la web
        pass

    return {"status": "error", "url_img": None}


@app.post("/api/descargar")
def iniciar_descarga(req: DescargaRequest, background_tasks: BackgroundTasks):
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    download_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), "..", "storage", "galleries", carpeta_limpia
        )
    )
    os.makedirs(download_dir, exist_ok=True)
    background_tasks.add_task(ejecutar_descarga, req.url, download_dir)
    return {"status": "success"}


@app.post("/api/descargar_imagen")
def iniciar_descarga_individual(
    req: DescargaUnaRequest, background_tasks: BackgroundTasks
):
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    download_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), "..", "storage", "galleries", carpeta_limpia
        )
    )
    os.makedirs(download_dir, exist_ok=True)
    background_tasks.add_task(
        ejecutar_descarga_individual, req.url_img, download_dir, req.index
    )
    return {"status": "success"}
