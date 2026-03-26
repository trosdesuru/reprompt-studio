# backend/app/core/webdriver_mgr.py
import logging
from contextlib import contextmanager

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

logger = logging.getLogger("webdriver")


def _get_chrome_options():
    """Genera las opciones estrictas para que Chrome funcione dentro de Docker."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    )
    return options


@contextmanager
def navegador_seguro():
    """
    Context manager que levanta Chrome y garantiza su destrucción al terminar.
    Uso: with navegador_seguro() as driver: ...
    """
    logger.info("🌐 Levantando instancia de Chrome Headless...")
    driver = webdriver.Chrome(options=_get_chrome_options())
    try:
        yield driver
    finally:
        logger.info("🔒 Destruyendo instancia de Chrome para liberar RAM...")
        driver.quit()
