import urllib.request
from urllib.error import URLError, HTTPError
import logging

logger = logging.getLogger(__name__)

MAGIC_SIGNATURES = {
    "png": b"\x89PNG\r\n\x1a\n",
    "jpeg": b"\xff\xd8\xff",
    "webp_riff": b"RIFF",
    "webp_webp": b"WEBP",
}


def validate_magic_bytes(file_url: str) -> bool:
    """
    Descarga los primeros 256 bytes de una URL y verifica que correspondan a una imagen real.
    Cumple con el principio de fallar de forma segura (Fail-Safe).
    """
    try:
        req = urllib.request.Request(file_url, headers={"Range": "bytes=0-256"})

        with urllib.request.urlopen(req, timeout=5) as response:
            header_bytes = response.read(256)

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
            f"[SECURITY] Archivo malicioso o formato inválido detectado. Abortando. URL: {file_url}"
        )
        return False

    except (HTTPError, URLError) as e:
        logger.error(f"[SECURITY] Error de red al auditar archivo temporal: {e}")
        return False
    except Exception as e:
        logger.error(f"[SECURITY] Error inesperado en auditoría: {e}")
        return False
