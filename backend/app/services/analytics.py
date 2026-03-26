# backend/app/services/analytics.py
import logging
from collections import Counter
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logger = logging.getLogger("analytics")

def extraer_metadata_galeria(driver, url: str, thumb_url: str) -> dict:
    """Extrae metadata y asocia la miniatura usando un driver existente."""
    # Abrimos una nueva pestaña para no perder la página de búsqueda
    driver.execute_script("window.open(arguments[0], '_blank');", url)
    driver.switch_to.window(driver.window_handles[-1])
    
    data = {"url": url, "thumb": thumb_url, "tags": {}, "title": "N/A", "pages": 0}
    wait = WebDriverWait(driver, 10)
    
    try:
        wait.until(EC.presence_of_element_located((By.ID, "gn")))
        data["title"] = driver.find_element(By.ID, "gn").text
        
        for row in driver.find_elements(By.CSS_SELECTOR, "#gdd tr"):
            if "Number of Pages" in row.text:
                data["pages"] = row.find_element(By.CLASS_NAME, "gdt2").text.split()[0]

        for row in driver.find_elements(By.CSS_SELECTOR, "#taglist tr"):
            cat = row.find_element(By.CLASS_NAME, "tc").text.replace(":", "").lower()
            tags = [a.text.lower() for a in row.find_elements(By.CSS_SELECTOR, "div a")]
            data["tags"][cat] = tags
    except Exception as e:
        logger.warning(f"⚠️ Falló la extracción en la galería (Posible aviso +18): {e}")
    finally:
        driver.close() # Cerramos la pestaña
        driver.switch_to.window(driver.window_handles[0]) # Volvems a la principal
    
    return data

def generar_resumen_analitico(db: list):
    """Genera un reporte analítico de los tags y artistas más populares."""
    all_artists = []
    all_tags = []
    for item in db:
        if "artist" in item.get("tags", {}):
            all_artists.extend(item["tags"]["artist"])
        for cat, tags in item.get("tags", {}).items():
            if cat != "artist": 
                all_tags.extend(tags)
                
    resumen = f"\n{'='*40}\n📊 RESUMEN ANALÍTICO\n{'='*40}\n"
    resumen += f"✅ Total Galerías analizadas: {len(db)}\n\n🎨 Top 5 Artistas:\n"
    for art, count in Counter(all_artists).most_common(5):
        resumen += f"   - {art.capitalize()}: {count} galerías\n"
        
    resumen += "\n🏷️ Top 5 Tags Relacionados:\n"
    for tag, count in Counter(all_tags).most_common(5):
        resumen += f"   - {tag}: {count} coincidencias\n"
    resumen += f"{'='*40}\n"
    
    logger.info(resumen)