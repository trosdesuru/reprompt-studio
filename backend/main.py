import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --- CONFIGURACIÓN ---
GALLERY_URL = "https://e-hentai.org/g/699672/3ee86422ff/"
DOWNLOAD_DIR = "eh_gallery_atelier_no_emma"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# --- CONFIGURACIÓN DE CHROME ---
chrome_options = Options()
# chrome_options.add_argument("--headless") # Descomenta si quieres que sea invisible
chrome_options.add_argument("--start-maximized")
# User-Agent para parecer un humano
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, 15)

def guardar_imagen(url, index):
    """Descarga la imagen usando requests para mayor estabilidad."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Referer': driver.current_url # Ayuda a evitar bloqueos de hotlinking
        }
        r = requests.get(url, headers=headers, stream=True, timeout=10)
        if r.status_code == 200:
            # Intentar obtener la extensión real
            ext = url.split('.')[-1].split('?')[0]
            if len(ext) > 4: ext = "jpg"
            
            filename = f"image_{index:03d}.{ext}"
            path = os.path.join(DOWNLOAD_DIR, filename)
            
            with open(path, 'wb') as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
            print(f"✅ Descargada: {filename}")
            return True
    except Exception as e:
        print(f"❌ Error al descargar imagen {index}: {e}")
    return False

def procesar_galeria():
    driver.get(GALLERY_URL)
    img_count = 1
    page_count = 1
    
    while True:
        print(f"\n📄 ESTÁS EN LA PÁGINA {page_count} de la galería")
        print("\n🔎 Escaneando página en busca de miniaturas...")
        try:
            # Esperar a que los enlaces de las imágenes aparezcan
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'a[href*="/s/"]')))
            thumbs = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/s/"]')
            
            # Obtener enlaces únicos
            links_paginas = []
            for t in thumbs:
                href = t.get_attribute("href")
                if href and href not in links_paginas:
                    links_paginas.append(href)
            
            print(f"📦 Encontrados {len(links_paginas)} enlaces de imagen.")

            for link in links_paginas:
                driver.get(link)
                try:
                    # Esperar a que la imagen cargue (id='img')
                    img_element = wait.until(EC.presence_of_element_located((By.ID, "img")))
                    src = img_element.get_attribute("src")
                    
                    if "509.gif" in src or "banner.jpg" in src:
                        print("⚠️ Aviso: Límite de cuota alcanzado (IP Banned temporalmente).")
                        input("Presiona Enter cuando hayas cambiado de IP o resuelto el problema...")
                        driver.refresh()
                        continue

                    guardar_imagen(src, img_count)
                    img_count += 1
                    time.sleep(1.5) # Pausa para no ser detectado como bot
                except Exception as e:
                    print(f"⚠️ No se pudo obtener la imagen en {link}")
                
                driver.back()
                # Pequeña espera para que la página de galería recargue
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'a[href*="/s/"]')))

            # --- LÓGICA DE PAGINACIÓN ---
            try:
                # Busca el botón '>' que indica "Siguiente"
                next_button = driver.find_element(By.XPATH, "//a[text()='>']")
                print("➡️ Saltando a la siguiente página de la galería...")
                next_button.click()
                time.sleep(3)
            except:
                print("🏁 Fin de la galería: No hay más páginas.")
                break
                
        except Exception:
            print("🚨 Error: No se detectan miniaturas.")
            print("Posibles causas: Captcha, bloqueo de IP o diseño de página diferente.")
            input("👉 Resuelve el problema en el navegador y presiona ENTER para reintentar...")
            continue

# --- INICIO DEL SCRIPT ---
if __name__ == "__main__":
    try:
        procesar_galeria()
    except KeyboardInterrupt:
        print("\n🛑 Proceso detenido por el usuario.")
    finally:
        print("🔒 Cerrando navegador...")
        driver.quit()