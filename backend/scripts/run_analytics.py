import logging
import os
import sys
import time
from urllib.parse import quote

# 1. HACK: Añadimos la raíz del backend al PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from app.core.webdriver_mgr import navegador_seguro
from app.services.analytics import extraer_metadata_galeria, generar_resumen_analitico
from app.utils.storage import guardar_json

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("cli_analytics")


def ejecutar_mapeo(termino: str, paginas: int):
    # CORREGIDO: URL completa restaurada
    url_base = f"https://e-hentai.org/?f_search={quote(termino)}"
    base_de_datos = []

    with navegador_seguro() as driver:
        wait = WebDriverWait(driver, 10)

        for p in range(paginas):
            logger.info(f"\n🌐 Cargando URL: {url_base}&page={p}")
            driver.get(f"{url_base}&page={p}")

            try:
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, "itg")))
                enlaces_galerias = driver.find_elements(
                    By.CSS_SELECTOR, ".itg a[href*='/g/']"
                )

                links_unicos = []
                for enlace in enlaces_galerias:
                    href = enlace.get_attribute("href")
                    if href and href not in links_unicos:
                        links_unicos.append(href)

                if not links_unicos:
                    logger.info("ℹ️ No se encontraron más galerías.")
                    break

                logger.info(
                    f"📦 Se encontraron {len(links_unicos)} galerías. Iniciando escaneo..."
                )

                for link in links_unicos:
                    try:
                        elemento = driver.find_element(
                            By.CSS_SELECTOR, f"a[href='{link}']"
                        )
                        thumb_url = "N/A"
                        try:
                            # CORREGIDO: XPath restaurado para encontrar la imagen
                            thumb_url = elemento.find_element(
                                By.XPATH, ".//img | ../..//img"
                            ).get_attribute("src")
                        except:
                            pass

                        logger.info(f"🔎 Analizando: {link.split('/')[-3]}")
                        info = extraer_metadata_galeria(driver, link, thumb_url)
                        base_de_datos.append(info)
                        time.sleep(2)  # Aumentado para mayor seguridad
                    except Exception as e:
                        logger.error(f"⚠️ Error en enlace {link}: {e}")
            except Exception:
                logger.error("🚨 ERROR CRÍTICO: No se encontró la tabla. ¿Captcha?")
                break

    if base_de_datos:
        generar_resumen_analitico(base_de_datos)
        nombre_archivo = f"analytics_{termino.replace(' ', '_').lower()}.json"
        ruta = guardar_json(
            "/storage/galleries" if os.path.exists("/storage") else ".",
            nombre_archivo,
            base_de_datos,
        )
        logger.info(f"📁 Datos guardados en: {ruta}")


if __name__ == "__main__":
    print("\n" + "=" * 40 + "\n🤖 HERRAMIENTA DE ANALÍTICAS\n" + "=" * 40)
    termino_usuario = input("🔍 Personaje/Tag: ")
    max_paginas = int(input("📄 Páginas (default 1): ") or 1)
    ejecutar_mapeo(termino_usuario, max_paginas)
