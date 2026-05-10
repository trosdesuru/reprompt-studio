import io
import json
import zipfile
import boto3
import logging
import time
import requests

from sqlmodel import Session, select

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from app.core.db import engine
from app.core.config import settings
from app.models.prompt import ImagePrompt
from app.models.directory import Directory
from app.services.security import http_session
from app.utils.storage import guardar_archivo

logger = logging.getLogger("downloader")


def generar_zip_coleccion(directory_id: str, user_email: str):
    """
    Tarea asíncrona para RQ. Empaqueta una colección entera en un ZIP
    usando buffers de memoria y la sube de vuelta a R2 como un enlace temporal.
    """
    s3_client = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )

    with Session(engine) as session:
        coleccion = session.get(Directory, directory_id)
        if not coleccion:
            return

        prompts = session.exec(
            select(ImagePrompt).where(ImagePrompt.directory_id == directory_id)
        ).all()

    # Buffer en memoria para no usar el disco SSD del servidor
    zip_buffer = io.BytesIO()
    metadata_list = []

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, prompt in enumerate(prompts):
            # 1. Extraer key de R2 desde la URL pública
            file_key = prompt.image_url.split("/")[-1]
            if "prompts/" not in file_key:
                file_key = f"prompts/{file_key}"

            # 2. Descargar imagen desde R2 a memoria
            try:
                response = s3_client.get_object(
                    Bucket=settings.R2_BUCKET_NAME, Key=file_key
                )
                image_bytes = response["Body"].read()

                # 3. Escribir imagen en el ZIP
                filename = f"{idx:03d}_{prompt.title.replace(' ', '_')}.png"
                zip_file.writestr(filename, image_bytes)

                # 4. Guardar metadatos para el JSON final
                metadata_list.append(
                    {
                        "filename": filename,
                        "prompt": prompt.prompt,
                        "model": prompt.model,
                        "sampler": prompt.sampler,
                    }
                )
            except Exception:
                continue  # Tolerancia a fallos, si una imagen falla, el ZIP sigue

        # 5. Escribir el manifiesto JSON con todos los prompts
        zip_file.writestr("prompts_metadata.json", json.dumps(metadata_list, indent=2))

    zip_buffer.seek(0)

    # 6. Subir el ZIP temporal a R2
    zip_key = f"temp/downloads/{directory_id}.zip"
    s3_client.upload_fileobj(
        zip_buffer,
        settings.R2_BUCKET_NAME,
        zip_key,
        ExtraArgs={"ContentType": "application/zip"},
    )

    # 7. Generar URL pre-firmada de 1 hora de vida
    download_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": zip_key},
        ExpiresIn=3600,
    )

    # Notificamos al usuario vía WebSockets que su ZIP está listo
    return download_url


def ejecutar_descarga_individual(image_key: str) -> str:
    """Genera un presigned URL instantáneo para una sola imagen (Sin Worker)."""
    s3_client = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )
    if "prompts/" not in image_key:
        image_key = f"prompts/{image_key}"

    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": image_key},
        ExpiresIn=3600,
    )
