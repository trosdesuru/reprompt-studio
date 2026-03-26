# backend/app/services/downloader.py
import logging
import time

import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from app.core.config import http_session
from app.core.webdriver_mgr import navegador_seguro

# Importamos nuestras utilidades limpias
from app.utils.storage import guardar_archivo

logger = logging.getLogger("downloader")


def ejecutar_descarga(url: str, download_dir: str):
    """Descarga todas las imágenes de una galería automatizando Chrome."""
    logger.info(f"📥 [DESCARGA TOTAL] Iniciando en: {download_dir}")

    # 1. SOLICITAMOS EL NAVEGADOR DE FORMA SEGURA
    with navegador_seguro() as driver:
        wait = WebDriverWait(driver, 10)

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

                    # Usamos requests para bajar los bytes
                    r = requests.get(
                        src,
                        headers={
                            "User-Agent": "Mozilla/5.0",
                            "Referer": driver.current_url,
                        },
                        stream=True,
                        timeout=10,
                    )

                    if r.status_code == 200:
                        ext = src.split(".")[-1].split("?")[0] if "." in src else "jpg"
                        nombre_archivo = f"image_{img_count:03d}.{ext}"

                        # Guardamos usando nuestro gestor de disco
                        guardar_archivo(
                            download_dir, nombre_archivo, r.iter_content(1024)
                        )

                        logger.info(f"🖼️ [{img_count:03d}] Guardada")
                        img_count += 1
                        time.sleep(1)
                except Exception as e:
                    logger.error(f"❌ Error en imagen: {e}")

                driver.back()

            # Paginación
            try:
                next_button = driver.find_element(By.XPATH, "//a[text()='>']")
                next_button.click()
                time.sleep(2)
            except:
                logger.info("🏁 Fin de las páginas. Saliendo del bucle.")
                break


def ejecutar_descarga_individual(url_img: str, download_dir: str, indice: int):
    """Descarga una sola imagen suelta (No necesita Selenium)."""
    try:
        r = requests.get(url_img, headers=http_session.headers, stream=True, timeout=10)
        if r.status_code == 200:
            ext = url_img.split(".")[-1].split("?")[0] if "." in url_img else "jpg"
            nombre_archivo = f"image_{indice:03d}.{ext}"

            guardar_archivo(download_dir, nombre_archivo, r.iter_content(1024))
            logger.info(f"✅ Imagen suelta {indice} guardada.")
        else:
            logger.error(f"❌ Error al descargar imagen {indice}, HTTP {r.status_code}")
    except Exception as e:
        logger.error(f"❌ Error de red en descarga individual: {e}")
