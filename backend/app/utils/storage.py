# backend/app/utils/storage.py
import os
import logging

logger = logging.getLogger("storage")


def preparar_directorio(ruta_base: str, nombre_carpeta: str) -> str:
    """Crea el directorio de forma segura si no existe."""
    ruta_completa = os.path.join(ruta_base, nombre_carpeta)
    os.makedirs(ruta_completa, exist_ok=True)
    return ruta_completa


def guardar_archivo(ruta_directorio: str, nombre_archivo: str, iter_content) -> str:
    """Guarda un flujo de bytes (stream) en el disco duro."""
    ruta_archivo = os.path.join(ruta_directorio, nombre_archivo)
    try:
        with open(ruta_archivo, "wb") as f:
            for chunk in iter_content:
                f.write(chunk)
        return ruta_archivo
    except Exception as e:
        logger.error(f"❌ Error al escribir en disco ({ruta_archivo}): {e}")
        raise e
