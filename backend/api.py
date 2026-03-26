import os
import re
import time
import logging
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import quote

# --- 1. CONFIGURACIÓN INICIAL ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = FastAPI(title="Galeria Scraper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sesión global optimizada
http_session = requests.Session()
http_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Cookie": "nw=1",
})

# --- 2. MODELOS DE DATOS ---
class DescargaRequest(BaseModel):
    url: str
    title: str

class DescargaUnaRequest(BaseModel):
    url_img: str
    title: str
    index: int


# --- 3. FUNCIONES CORE DE DESCARGA ---
def get_chrome_options():
    options = Options()
    options.add_argument("--headless=new") 
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    return options

def ejecutar_descarga_total(url: str, carpeta_destino: str):
    logger.info(f"📥 [DESCARGA TOTAL] Iniciando en: {carpeta_destino}")
    driver = webdriver.Chrome(options=get_chrome_options())
    wait = WebDriverWait(driver, 10)
    try:
        driver.get(url)
        driver.add_cookie({"name": "nw", "value": "1", "domain": ".e-hentai.org"})
        driver.refresh()
        img_count = 1
        
        while True:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#gdt, .itg")))
            thumbs = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/s/"]')
            links = list(dict.fromkeys([t.get_attribute("href") for t in thumbs if t.get_attribute("href")]))

            for link in links:
                driver.get(link)
                try:
                    img_element = wait.until(EC.presence_of_element_located((By.ID, "img")))
                    src = img_element.get_attribute("src")
                    r = requests.get(src, headers={"User-Agent": "Mozilla/5.0", "Referer": driver.current_url}, stream=True, timeout=10)
                    
                    if r.status_code == 200:
                        ext = src.split(".")[-1].split("?")[0] if "." in src else "jpg"
                        path = os.path.join(carpeta_destino, f"image_{img_count:03d}.{ext}")
                        with open(path, "wb") as f:
                            for chunk in r.iter_content(1024): f.write(chunk)
                        logger.info(f"🖼️ [{img_count:03d}] Guardada")
                        img_count += 1
                        time.sleep(1)
                except Exception as e:
                    logger.error(f"❌ Error en imagen: {e}")
                driver.back()

            try:
                next_button = driver.find_element(By.XPATH, "//a[text()='>']")
                next_button.click()
                time.sleep(2)
            except:
                break
    finally:
        driver.quit()

def ejecutar_descarga_individual(url_img: str, carpeta_destino: str, indice: int):
    try:
        r = requests.get(url_img, headers=http_session.headers, stream=True, timeout=10)
        if r.status_code == 200:
            ext = url_img.split(".")[-1].split("?")[0] if "." in url_img else "jpg"
            path = os.path.join(carpeta_destino, f"image_{indice:03d}.{ext}")
            with open(path, "wb") as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
            logger.info(f"✅ Imagen suelta {indice} guardada.")
        else:
             logger.error(f"❌ Error al descargar imagen {indice}, HTTP {r.status_code}")
    except Exception as e:
        logger.error(f"❌ Error de red en descarga individual: {e}")


# --- 4. ENDPOINTS API ---
@app.get("/api/buscar")
def buscar_galerias(query: str, paginas: int = 1):
    resultados = [] 
    url_base = f"https://e-hentai.org/?f_search={quote(query)}"
    try:
        for p in range(paginas):
            r = http_session.get(f"{url_base}&page={p}", timeout=10)
            soup = BeautifulSoup(r.text, "lxml")
            for tarjeta in soup.select(".itg tr, .itg .gl1t"):
                enlace = tarjeta.select_one("a[href*='/g/']")
                if not enlace: continue
                
                img_tag = tarjeta.select_one("img")
                thumb = img_tag.get("data-src") or img_tag.get("src") if img_tag else "N/A"
                
                resultados.append({"url": enlace["href"], "thumb": thumb, "title": enlace.text.strip()})
        return {"status": "success", "data": resultados}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/leer")
def leer_galeria(url: str):
    paginas = []
    try:
        r = http_session.get(url, timeout=10)
        soup = BeautifulSoup(r.text, "lxml")
        for a in soup.select('#gdt a[href*="/s/"], .itg a[href*="/s/"]'):
            if a.get("href"): paginas.append(a.get("href"))
        return {"status": "success", "paginas": list(dict.fromkeys(paginas))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/resolver_imagen")
def resolver_imagen(url: str):
    try:
        r = http_session.get(url, timeout=5)
        match = re.search(r'<img id="img" src="(.*?)"', r.text)
        if match: return {"status": "success", "url_img": match.group(1)}
    except: pass
    return {"status": "error", "url_img": None}


# --- 5. ENDPOINTS DE DESCARGA (FONDOS / WORKER) ---
@app.post("/api/descargar")
def iniciar_descarga_total(req: DescargaRequest, background_tasks: BackgroundTasks):
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    download_dir = os.path.join("/storage", "galleries", carpeta_limpia)
    os.makedirs(download_dir, exist_ok=True)
    
    background_tasks.add_task(ejecutar_descarga_total, req.url, download_dir)
    return {"status": "success", "message": "Descarga total en cola"}

@app.post("/api/descargar_imagen")
def iniciar_descarga_individual_api(req: DescargaUnaRequest, background_tasks: BackgroundTasks):
    logger.info(f"📥 Cola: Imagen suelta de {req.title} (Índice: {req.index})")
    
    carpeta_limpia = re.sub(r'[\\/*?:"<>|]', "", req.title).strip() or "galeria"
    download_dir = os.path.join("/storage", "galleries", carpeta_limpia)
    os.makedirs(download_dir, exist_ok=True)
    
    background_tasks.add_task(ejecutar_descarga_individual, req.url_img, download_dir, req.index)
    return {"status": "success", "message": f"Imagen {req.index} en cola"}