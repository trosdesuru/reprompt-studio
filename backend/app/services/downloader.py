import logging
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

logger = logging.getLogger("downloader")

def ejecutar_descarga(url: str, storage_path: str):
    logger.info(f"🏁 Iniciando proceso para URL: {url}")
    
    chrome_options = Options()
    # Argumentos críticos para Docker
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    driver = None
    try:
        logger.info("🌐 Abriendo instancia de Chrome...")
        driver = webdriver.Chrome(options=chrome_options)
        
        logger.info(f"🔗 Navegando a la galería...")
        driver.get(url)
        
        # Log para debug: Ver si cargó el sitio
        logger.info(f"📄 Título detectado: {driver.title}")
        
        # --- AQUÍ VA TU LÓGICA DE SCRAPEO ESPECÍFICA ---
        # Ejemplo: crear carpeta si no existe
        os.makedirs(storage_path, exist_ok=True)
        time.sleep(2) # Pausa amigable
        
        logger.info(f"✅ Descarga completada en: {storage_path}")
        return {"status": "success", "path": storage_path}

    except Exception as e:
        logger.error(f"❌ ERROR en el Worker: {str(e)}", exc_info=True)
        raise e
    finally:
        if driver:
            driver.quit()
            logger.info("🔒 Navegador cerrado correctamente.")