import os
import json
import time
from collections import Counter
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import quote

# --- CONFIGURACIÓN DINÁMICA ---
termino_usuario = input("🔍 Personaje/Tag a investigar: ")
max_paginas = int(input("📄 Páginas de resultados: ") or 1)

chrome_options = Options()
# chrome_options.add_argument("--headless")
chrome_options.add_argument("--start-maximized") # Mejor ver a pantalla completa
# VITAL: Evita que el servidor te bloquee inmediatamente
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, 10)

def extraer_metadata_galeria(url, thumb_url):
    """Extrae metadata y asocia la miniatura de la portada."""
    driver.execute_script("window.open(arguments[0], '_blank');", url)
    driver.switch_to.window(driver.window_handles[-1])
    
    data = {"url": url, "thumb": thumb_url, "tags": {}, "title": "N/A", "pages": 0}
    
    try:
        # Esperar al título para confirmar que la página cargó
        wait.until(EC.presence_of_element_located((By.ID, "gn")))
        data["title"] = driver.find_element(By.ID, "gn").text
        
        gdd_info = driver.find_elements(By.CSS_SELECTOR, "#gdd tr")
        for row in gdd_info:
            if "Number of Pages" in row.text:
                data["pages"] = row.find_element(By.CLASS_NAME, "gdt2").text.split()[0]

        rows = driver.find_elements(By.CSS_SELECTOR, "#taglist tr")
        for row in rows:
            cat = row.find_element(By.CLASS_NAME, "tc").text.replace(":", "").lower()
            tags = [a.text.lower() for a in row.find_elements(By.CSS_SELECTOR, "div a")]
            data["tags"][cat] = tags
    except Exception as e:
        print(f"   ⚠️ Falló la extracción en la galería (Posible aviso de contenido).")
    
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    return data

def generar_analiticas(db):
    all_artists = []
    all_tags = []
    for item in db:
        if "artist" in item["tags"]:
            all_artists.extend(item["tags"]["artist"])
        for cat in item["tags"]:
            if cat != "artist": 
                all_tags.extend(item["tags"][cat])
                
    print("\n" + "="*40)
    print("📊 RESUMEN ANALÍTICO")
    print("="*40)
    print(f"✅ Total Galerías analizadas: {len(db)}")
    
    print("\n🎨 Top 5 Artistas:")
    for art, count in Counter(all_artists).most_common(5):
        print(f"   - {art.capitalize()}: {count} galerías")
        
    print("\n🏷️ Top 5 Tags Relacionados:")
    for tag, count in Counter(all_tags).most_common(5):
        print(f"   - {tag}: {count} coincidencias")
    print("="*40 + "\n")

def buscar_y_mapear():
    url_base = f"https://e-hentai.org/?f_search={quote(termino_usuario)}"
    base_de_datos = []

    for p in range(max_paginas):
        print(f"\n🌐 Cargando URL: {url_base}&page={p}")
        driver.get(f"{url_base}&page={p}")
        
        try:
            # Esperamos a que aparezca el contenedor de resultados general (.itg)
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "itg")))
            
            # Selector más universal: Busca cualquier enlace de galería dentro de la tabla principal
            enlaces_galerias = driver.find_elements(By.CSS_SELECTOR, ".itg a[href*='/g/']")
            
            # Limpiar duplicados (a veces el enlace está en la imagen y en el título)
            links_unicos = []
            for enlace in enlaces_galerias:
                href = enlace.get_attribute("href")
                if href and href not in links_unicos:
                    links_unicos.append(href)

            if not links_unicos:
                print("ℹ️ La página cargó, pero no se encontraron galerías.")
                break

            print(f"📦 Se encontraron {len(links_unicos)} posibles galerías. Iniciando escaneo...")

            for link in links_unicos:
                try:
                    # Buscamos la imagen intentando atraparla mediante el enlace
                    # (Esto es menos propenso a errores que depender de la estructura de la fila 'tr')
                    elemento_enlace = driver.find_element(By.CSS_SELECTOR, f"a[href='{link}']")
                    thumb_url = "N/A"
                    try:
                        # Intenta buscar una imagen dentro o muy cerca del enlace
                        img_tag = elemento_enlace.find_element(By.XPATH, ".//img | ../..//img")
                        thumb_url = img_tag.get_attribute("src")
                    except:
                        pass # Si no encuentra miniatura, sigue adelante
                    
                    print(f"🔎 Analizando: {link.split('/')[-3]}")
                    info = extraer_metadata_galeria(link, thumb_url)
                    base_de_datos.append(info)
                    time.sleep(1) # Pausa obligatoria para evitar baneos
                except Exception as e:
                    print(f"   ⚠️ No se pudo procesar el enlace {link}: {e}")
                    continue
                    
        except Exception as e:
            print("\n🚨 ERROR CRÍTICO: No se encontró la tabla de resultados.")
            print("Posibles causas:")
            print("1. Te ha saltado un Captcha.")
            print("2. Aviso de advertencia de contenido (+18).")
            print("3. Te han baneado la IP temporalmente (Aparece un panda triste).")
            input("👉 Revisa la ventana de Chrome. Resuelve el problema y pulsa ENTER para reintentar o Ctrl+C para salir...")
            continue # Vuelve a intentar el mismo ciclo

    if base_de_datos:
        generar_analiticas(base_de_datos)
        filename = f"analytics_{termino_usuario.replace(' ', '_').lower()}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(base_de_datos, f, indent=4, ensure_ascii=False)
        print(f"📁 Base de datos guardada en: {filename}")
    else:
        print("\n❌ No se recopilaron datos. Verifica tu búsqueda o el navegador.")

if __name__ == "__main__":
    try:
        buscar_y_mapear()
    finally:
        driver.quit()