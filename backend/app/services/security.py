import logging
import requests

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


def validate_magic_bytes(file_bytes: bytes) -> bool:
    """
    Verifica la autenticidad del archivo leyendo sus primeros bytes directamente.
    """
    if not file_bytes or len(file_bytes) < 12:
        return False

    if file_bytes.startswith(MAGIC_SIGNATURES["png"]):
        return True
    if file_bytes.startswith(MAGIC_SIGNATURES["jpeg"]):
        return True
    if (
        file_bytes.startswith(MAGIC_SIGNATURES["webp_riff"])
        and file_bytes[8:12] == MAGIC_SIGNATURES["webp_webp"]
    ):
        return True

    logger.warning(
        "[SECURITY] Archivo malicioso detectado y bloqueado (Magic Bytes inválidos)."
    )
    return False
