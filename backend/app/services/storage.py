import boto3
import logging
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger(__name__)

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.R2_ENDPOINT_URL,
    aws_access_key_id=settings.R2_ACCESS_KEY,
    aws_secret_access_key=settings.R2_SECRET_KEY,
    region_name=getattr(settings, "R2_REGION", "auto"),
    config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
)


def move_to_permanent(old_key: str, new_key: str) -> bool:
    try:
        s3_client.copy_object(  # NOSONAR
            Bucket=settings.R2_BUCKET_NAME,
            CopySource={"Bucket": settings.R2_BUCKET_NAME, "Key": old_key},
            Key=new_key,
        )
        s3_client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=old_key)  # NOSONAR
        return True
    except Exception:
        logger.exception("[STORAGE] Error moviendo llave %s a %s", old_key, new_key)
        return False


def delete_file(key: str) -> None:
    """Destruye un objeto malicioso o huérfano."""
    try:
        s3_client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)  # NOSONAR
    except Exception:
        logger.exception("[STORAGE] Error borrando llave %s", key)
