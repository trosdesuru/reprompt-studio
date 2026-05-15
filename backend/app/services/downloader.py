import io
import os
import json
import zipfile
import boto3
import logging

from sqlmodel import Session, select

from app.core.db import engine
from app.core.config import settings
from app.models.prompt import ImagePrompt
from app.models.directory import Directory

logger = logging.getLogger("downloader")


def generar_zip_coleccion(directory_id: str):
    s3_client = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name=os.getenv("R2_REGION", "auto"),
    )

    with Session(engine) as session:
        coleccion = session.get(Directory, directory_id)
        if not coleccion:
            return

        prompts = session.exec(
            select(ImagePrompt).where(ImagePrompt.directory_id == directory_id)
        ).all()

    zip_buffer = io.BytesIO()
    metadata_list = []

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, prompt in enumerate(prompts):
            file_key = prompt.image_url.split("/")[-1]
            if "prompts/" not in file_key:
                file_key = f"prompts/{file_key}"

            try:
                response = s3_client.get_object(  Bucket=settings.R2_BUCKET_NAME, Key=file_key # NOSONAR
                )
                image_bytes = response["Body"].read()

                filename = f"{idx:03d}_{prompt.title.replace(' ', '_')}.png"
                zip_file.writestr(filename, image_bytes)

                metadata_list.append(
                    {
                        "filename": filename,
                        "prompt": prompt.prompt,
                        "model": prompt.model,
                        "sampler": prompt.sampler,
                    }
                )
            except Exception:
                continue

        zip_file.writestr("prompts_metadata.json", json.dumps(metadata_list, indent=2))

    zip_buffer.seek(0)

    zip_key = f"temp/downloads/{directory_id}.zip"
    s3_client.upload_fileobj(
        zip_buffer,
        settings.R2_BUCKET_NAME,
        zip_key,
        ExtraArgs={"ContentType": "application/zip"},
    )

    download_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": zip_key},
        ExpiresIn=3600,
    )

    return download_url


def ejecutar_descarga_individual(image_key: str) -> str:
    s3_client = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name=os.getenv("R2_REGION", "auto"),
    )
    if "prompts/" not in image_key:
        image_key = f"prompts/{image_key}"

    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": image_key},
        ExpiresIn=3600,
    )
