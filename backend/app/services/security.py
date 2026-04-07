import logging
import requests
from app.core.config import settings
from urllib.error import URLError, HTTPError

logger = logging.getLogger(__name__)

http_session = requests.Session()
http_session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Cookie": "nw=1",
    }
)

MAGIC_SIGNATURES = {
    "png": b"\x89PNG\r\n\x1a\n",
    "jpeg": b"\xff\xd8\xff",
    "webp_riff": b"RIFF",
    "webp_webp": b"WEBP",
}


def validate_magic_bytes(file_url: str) -> bool:
    """
    Verifica la autenticidad del archivo descargando solo 256 bytes.
    Programación Defensiva: Asume falsedad por defecto.
    """
    if not file_url:
        return False

    if not file_url.startswith(settings.R2_PUBLIC_URL):
        logger.error(
            f"[SECURITY] Intento de SSRF bloqueado: {file_url}"
        )
        return False

    try:
        # Inyectamos cabecera Range de forma dinámica para esta petición
        response = http_session.get(
            file_url, headers={"Range": "bytes=0-256"}, timeout=5
        )
        response.raise_for_status()
        header_bytes = response.content

        if header_bytes.startswith(MAGIC_SIGNATURES["png"]):
            return True
        if header_bytes.startswith(MAGIC_SIGNATURES["jpeg"]):
            return True
        if (
            header_bytes.startswith(MAGIC_SIGNATURES["webp_riff"])
            and header_bytes[8:12] == MAGIC_SIGNATURES["webp_webp"]
        ):
            return True

        logger.warning(
            f"[SECURITY] Archivo malicioso detectado y bloqueado. URL: {file_url}"
        )
        return False

    except requests.RequestException as e:
        logger.error(f"[SECURITY] Error de red al auditar URL {file_url}: {e}")
        return False
