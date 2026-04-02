# backend/app/utils/storage.py
import json
import logging
import os
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger("storage")

# 🟢 CONFIGURACIÓN R2 / S3 LECTURA DEL .ENV
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")

# Inicializamos el cliente S3 de forma segura (solo si hay credenciales)
s3_client = None
if all([R2_ENDPOINT_URL, R2_ACCESS_KEY, R2_SECRET_KEY]):
    s3_client = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",  # Cloudflare R2 requiere "auto" o "us-east-1"
    )


def subir_imagen_a_r2(
    file_bytes: bytes, file_name: str, content_type: str = "image/webp"
) -> str:
    """
    Sube un archivo binario a Cloudflare R2 y devuelve la URL pública final.
    """
    if not s3_client or not R2_BUCKET_NAME:
        logger.error("⚠️ Credenciales de R2 no configuradas. Abortando subida.")
        raise ValueError("Servicio de almacenamiento en la nube no configurado.")

    try:
        logger.info(f"☁️ Subiendo {file_name} a R2...")
        s3_client.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=file_name,
            Body=file_bytes,
            ContentType=content_type,
        )

        # Construir y devolver la URL pública exacta para guardarla en PostgreSQL
        url_publica = f"{R2_PUBLIC_URL.rstrip('/')}/{file_name}"
        logger.info(f"✅ Subida exitosa: {url_publica}")
        return url_publica

    except ClientError as e:
        logger.error(f"❌ Error de conexión con R2 (Boto3): {e}")
        raise e
    except Exception as e:
        logger.error(f"❌ Error inesperado subiendo a R2: {e}")
        raise e


def generar_presigned_url(file_name: str, content_type: str) -> dict:
    """Genera un ticket de un solo uso para que el Frontend suba directo a R2"""
    if not s3_client or not R2_BUCKET_NAME:
        raise ValueError("Servicio R2 no configurado en .env.")
    try:
        # Genera una URL temporal con permiso explícito de 'put_object' (Subida)
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": R2_BUCKET_NAME,
                "Key": file_name,
                "ContentType": content_type,
            },
            ExpiresIn=3600,  # El ticket caduca en 1 hora
        )

        # Esta será la URL final pública una vez subido el archivo
        url_publica = f"{R2_PUBLIC_URL.rstrip('/')}/{file_name}"
        return {"upload_url": presigned_url, "file_url": url_publica}

    except Exception as e:
        logger.error(f"❌ Error generando presigned URL: {e}")
        raise e


def eliminar_de_r2(file_url: str):
    """Borra físicamente el archivo del bucket para no dejar huérfanos"""
    if not s3_client or not R2_BUCKET_NAME or not file_url:
        return
    try:
        base_url = R2_PUBLIC_URL.rstrip("/")
        # Verificamos que la URL pertenezca a nuestro bucket
        if file_url.startswith(base_url):
            # Extraemos la ruta interna (ej. prompts/edu/archivo.png)
            key = file_url.replace(base_url + "/", "")
            logger.info(f"🗑️ Eliminando de R2: {key}")
            s3_client.delete_object(Bucket=R2_BUCKET_NAME, Key=key)
    except Exception as e:
        logger.error(f"❌ Error eliminando objeto de R2: {e}")


# ========================================================
# ⬇️ FUNCIONES LEGACY (Mantenidas para compatibilidad local)
# ========================================================


def preparar_directorio(ruta_base: str, nombre_carpeta: str) -> str:
    """Crea el directorio de forma segura si no existe."""
    ruta_completa = os.path.join(ruta_base, nombre_carpeta)
    os.makedirs(ruta_completa, exist_ok=True)
    return ruta_completa


def guardar_archivo(ruta_directorio: str, nombre_archivo: str, iter_content) -> str:
    """Guarda un flujo de bytes (stream) en el disco duro local."""
    ruta_archivo = os.path.join(ruta_directorio, nombre_archivo)
    try:
        with open(ruta_archivo, "wb") as f:
            for chunk in iter_content:
                f.write(chunk)
        return ruta_archivo
    except Exception as e:
        logger.error(f"❌ Error al escribir en disco ({ruta_archivo}): {e}")
        raise e


def guardar_json(ruta_directorio: str, nombre_archivo: str, datos: list | dict) -> str:
    """Guarda un diccionario o lista de Python como archivo .json local"""
    os.makedirs(ruta_directorio, exist_ok=True)
    ruta_archivo = os.path.join(ruta_directorio, nombre_archivo)
    try:
        with open(ruta_archivo, "w", encoding="utf-8") as f:
            json.dump(datos, f, indent=4, ensure_ascii=False)
        return ruta_archivo
    except Exception as e:
        logger.error(f"❌ Error al guardar JSON ({ruta_archivo}): {e}")
        raise e
