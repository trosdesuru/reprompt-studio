import boto3
import logging
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger(__name__)

# Centralizamos el cliente aquí
s3_client = boto3.client(
    "s3",
    endpoint_url=settings.R2_ENDPOINT_URL,
    aws_access_key_id=settings.R2_ACCESS_KEY,
    aws_secret_access_key=settings.R2_SECRET_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
)


def move_to_permanent(old_key: str, new_key: str) -> bool:
    """Mueve un objeto dentro del bucket y borra el original."""
    try:
        s3_client.copy_object(
            Bucket=settings.R2_BUCKET_NAME,
            CopySource={"Bucket": settings.R2_BUCKET_NAME, "Key": old_key},
            Key=new_key,
        )
        s3_client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=old_key)
        return True
    except Exception as e:
        logger.error(f"[STORAGE] Error moviendo llave {old_key} a {new_key}: {e}")
        return False


def delete_file(key: str) -> None:
    """Destruye un objeto malicioso o huérfano."""
    try:
        s3_client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
    except Exception as e:
        logger.error(f"[STORAGE] Error borrando llave {key}: {e}")
