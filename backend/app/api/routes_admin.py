import os
import logging
import secrets

from datetime import datetime, timedelta, timezone

from sqlmodel import select, Session, func, delete, text
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.api.deps import get_optional_user, get_current_admin, get_session
from app.models.user import User, AuditLog, InviteCode
from app.core.redis_config import conn as redis_client
from app.services.audit_service import AuditService
from app.core.security import get_password_hash
from app.models.user import AuditLog
from app.models.directory import Directory
from app.models.gallery import GalleryMetric
from app.services.storage import s3_client
from app.models.prompt import ImagePrompt
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger("backend")


class BugReport(BaseModel):
    User: str
    message: str
    stack: str | None = None
    digest: str | None = None
    url: str
    timestamp: str


class UserActionRequest(BaseModel):
    user_id: str
    action: str


@router.post("/bugs")
async def receive_bug_report(report: BugReport, request: Request):
    """
    Recibe la telemetría del Error Boundary del Frontend.
    """
    client_ip = request.client.host if request.client else "IP Desconocida"

    logger.critical("=" * 60)
    logger.critical(f"🚨 NUEVO BUG REPORTADO A Trosdesuru 🚨")
    logger.critical(f"📍 Origen: {report.url} (IP: {client_ip})")
    logger.critical(f"🕰️ Timestamp: {report.timestamp}")
    logger.critical(f"💬 Mensaje: {report.message}")

    if report.stack:
        logger.critical(f"📚 Stacktrace: \n{report.stack[:600]}...")
    logger.critical("=" * 60)

    # NOTA FUTURA: Aquí podrías añadir un código simple usando 'httpx' o 'requests'
    # para enviar este reporte como un mensaje push a un bot de Telegram, a un canal de Discord,
    # o insertarlo en una nueva tabla 'AuditBugs' en Neon.tech.

    return {
        "status": "success",
        "message": "Reporte interceptado con éxito en la base.",
    }


@router.get("/database-stats")
def get_db_stats(
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    total_users = session.exec(select(func.count(User.id))).one()
    total_prompts = session.exec(select(func.count(ImagePrompt.id))).one()
    all_users = session.exec(select(User).limit(100)).all()

    try:
        db_size_bytes = session.exec(
            text("SELECT pg_database_size(current_database());")
        ).first()[0]
        db_size_mb = round(db_size_bytes / (1024 * 1024), 2)
    except Exception:
        db_size_mb = 0.0

    return {
        "status": "success",
        "total_users": total_users,
        "total_prompts": total_prompts,
        "total_mb": db_size_mb,
        "limit_mb": 500,
        "users": all_users,
    }


@router.get("/storage-stats")
def get_storage_stats(current_admin: User = Depends(get_current_admin)):
    response = s3_client.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
    archivos = response.get("Contents", [])

    peso_total_bytes = sum(f["Size"] for f in archivos)

    total_mb = round(peso_total_bytes / (1024 * 1024), 2)

    return {
        "status": "success",
        "total_files": len(archivos),
        "total_mb": total_mb,
        "limit_mb": 10240,
    }


@router.get("/storage-stats")
def get_storage_stats(current_admin: User = Depends(get_current_admin)):
    try:
        # Pide a Cloudflare la lista de todos los objetos en tu Bucket
        response = s3_client.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
        archivos = response.get("Contents", [])

        # Suma los bytes de todos los archivos
        peso_total_bytes = sum(f["Size"] for f in archivos)

        # Convertimos a Megabytes y redondeamos a 2 decimales
        total_mb = round(peso_total_bytes / (1024 * 1024), 2)

        return {"status": "success", "total_files": len(archivos), "total_mb": total_mb}
    except Exception as e:
        logger.error(f"❌ Error leyendo R2: {e}")
        raise HTTPException(
            status_code=500, detail="Fallo de conexión con Cloudflare R2"
        )


@router.post("/garbage-collect")
def run_garbage_collector(
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    🧹 El Recolector de Basura:
    1. Borra Logs de más de 30 días.
    2. Borra Códigos de Invitación usados hace más de 30 días.
    3. Destruye archivos en /temp de R2 que tengan más de 24 horas.
    """
    logger.info(
        f"🧹 [GARBAGE_COLLECTOR] Protocolo iniciado por el Admin: {current_admin.username}"
    )

    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    one_day_ago = now - timedelta(days=1)

    # --- 1. LIMPIEZA DE BASE DE DATOS (NEON) ---
    try:
        # Borrar Logs Viejos
        query_logs = delete(AuditLog).where(AuditLog.timestamp < thirty_days_ago)
        result_logs = session.exec(query_logs)
        deleted_logs = result_logs.rowcount

        # Borrar Invitaciones Usadas y Viejas
        query_invites = delete(InviteCode).where(
            InviteCode.is_used == True, InviteCode.created_at < thirty_days_ago
        )
        result_invites = session.exec(query_invites)
        deleted_invites = result_invites.rowcount

        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"❌ [GARBAGE_COLLECTOR] Fallo crítico en la DB: {e}")
        raise HTTPException(status_code=500, detail="Fallo en la purga de PostgreSQL")

    # --- 2. LIMPIEZA DE INFRAESTRUCTURA (CLOUDFLARE R2) ---
    deleted_temp_files = 0
    try:
        # Listamos objetos en la carpeta temp/
        response = s3_client.list_objects_v2(
            Bucket=settings.R2_BUCKET_NAME, Prefix="temp/"
        )

        if "Contents" in response:
            objects_to_delete = []
            for obj in response["Contents"]:
                # Si el archivo lleva más de 24h sin ser movido a /prompts, es basura.
                if obj["LastModified"] < one_day_ago:
                    objects_to_delete.append({"Key": obj["Key"]})

            if objects_to_delete:
                # La API de S3/R2 permite borrar hasta 1000 objetos por petición HTTP
                for i in range(0, len(objects_to_delete), 1000):
                    batch = objects_to_delete[i : i + 1000]
                    s3_client.delete_objects(
                        Bucket=settings.R2_BUCKET_NAME, Delete={"Objects": batch}
                    )
                deleted_temp_files = len(objects_to_delete)

    except Exception as e:
        logger.error(f"❌ [GARBAGE_COLLECTOR] Fallo crítico en R2: {e}")
        # No lanzamos excepción aquí para que al menos la limpieza de DB sea exitosa
        pass

    logger.info(
        f"✅ [GARBAGE_COLLECTOR] Completado. Logs: {deleted_logs} | Invites: {deleted_invites} | R2_Temp: {deleted_temp_files}"
    )

    return {
        "status": "success",
        "deleted_logs": deleted_logs,
        "deleted_invites": deleted_invites,
        "deleted_temp_files": deleted_temp_files,
    }


@router.post("/users/action")
def manage_user_action(
    data: UserActionRequest,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    target_user = session.get(User, data.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if target_user.role == "admin" and current_admin.id != target_user.id:
        raise HTTPException(
            status_code=403, detail="No puedes modificar a otro administrador."
        )

    if data.action == "upgrade":
        target_user.role = "artist"
        msg = f"Usuario ascendido a Artist VIP."

    elif data.action == "deactivate":
        target_user.is_active = False
        msg = f"Cuenta desactivada (Shadowban)."

    elif data.action == "activate":
        target_user.is_active = True
        msg = f"Cuenta reactivada."

    elif data.action == "reset_password":
        new_pass = secrets.token_urlsafe(6)
        target_user.hashed_password = get_password_hash(new_pass)
        session.commit()
        return {
            "status": "success",
            "message": "Contraseña reseteada",
            "new_password": new_pass,
        }

    else:
        raise HTTPException(status_code=400, detail="Acción no válida")

    session.add(target_user)
    session.commit()

    # 🟢 Registrar en Auditoría
    AuditService.log_action(
        session,
        current_admin.username,
        f"USER_{data.action.upper()}",
        f"Afectado: @{target_user.username}",
    )

    return {"status": "success", "message": msg}


@router.delete("/users/{user_id}")
def delete_user_completely(
    user_id: str,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    Exterminio Total en Cascada.
    Respeta la integridad referencial de PostgreSQL (Foreign Keys).
    """
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if target_user.role == "admin":
        raise HTTPException(
            status_code=403, detail="No se puede borrar a un administrador."
        )

    try:
        # 1. Recuperar todas las URLs de imágenes antes de borrar la DB
        prompts = session.exec(
            select(ImagePrompt).where(ImagePrompt.user_id == target_user.id)
        ).all()
        image_urls_to_delete = [p.image_url for p in prompts if p.image_url]

        # 2. Delegar borrado físico de R2 a Background Task
        if image_urls_to_delete:
            background_tasks.add_task(purge_r2_images_batch, image_urls_to_delete)

        # 3. 🟢 RESOLVER CONSTRAINT: Desvincular el Código de Invitación
        # No borramos el código para que siga constando como "usado", pero rompemos el enlace.
        invites = session.exec(
            select(InviteCode).where(InviteCode.used_by_id == target_user.id)
        ).all()
        for inv in invites:
            inv.used_by_id = None
            session.add(inv)

        # 4. 🟢 BORRADO EN CASCADA (Desde los hijos hasta el padre)
        # Borramos las métricas de galería que pertenezcan a él
        session.exec(
            delete(GalleryMetric).where(GalleryMetric.user_id == target_user.id)
        )

        # Borramos las imágenes
        session.exec(delete(ImagePrompt).where(ImagePrompt.user_id == target_user.id))

        # Borramos las colecciones
        session.exec(delete(Directory).where(Directory.user_id == target_user.id))

        # Finalmente, ejecutamos al usuario
        session.delete(target_user)

        # Consolidamos todos los cambios en una sola transacción ACID
        session.commit()

        AuditService.log_action(
            session,
            current_admin.username,
            "USER_DELETED",
            f"Exterminado: @{target_user.username} y {len(prompts)} prompts.",
        )

        return {
            "status": "success",
            "message": f"Usuario @{target_user.username} exterminado.",
        }

    except Exception as e:
        session.rollback()
        logger.error(f"Error crítico en exterminio de usuario: {e}")
        raise HTTPException(
            status_code=500, detail="Fallo al ejecutar el exterminio en cascada."
        )


@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: str,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    Recupera el historial de un usuario y su estado en tiempo real.
    """
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 1. Comprobar estado en Redis (Costo de DB: 0)
    is_online = False
    try:
        if redis_client.exists(f"user:online:{target_user.id}"):
            is_online = True
    except:
        pass

    # 2. Consultar el rastro de actividad (Limitado a los últimos 50 para no saturar)
    logs = session.exec(
        select(AuditLog)
        .where(AuditLog.username == target_user.username)
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
    ).all()

    return {"status": "success", "is_online": is_online, "logs": logs}


# --- Helper Function for Background Task ---
def purge_r2_images_batch(image_urls: list):
    """Borra múltiples archivos de R2 en lote"""
    from app.services.storage import s3_client
    from app.core.config import settings

    base_url = settings.R2_PUBLIC_URL.rstrip("/")

    objects_to_delete = []
    for url in image_urls:
        if url.startswith(base_url):
            key = url.replace(base_url + "/", "")
            objects_to_delete.append({"Key": key})

    if objects_to_delete:
        for i in range(0, len(objects_to_delete), 1000):
            batch = objects_to_delete[i : i + 1000]
            try:
                s3_client.delete_objects(
                    Bucket=settings.R2_BUCKET_NAME, Delete={"Objects": batch}
                )
            except Exception as e:
                pass  # Fallo silencioso en background


@router.post("/storage/purge-all")
def purge_entire_r2_bucket(
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    ⚠️ BOTÓN DEL PÁNICO: Borra TODOS los archivos del bucket R2 sin piedad.
    Útil para entornos de desarrollo o tras un reset completo de la base de datos.
    """
    logger.warning(
        f"☢️ [R2_PURGE] Protocolo de aniquilación iniciado por: {current_admin.username}"
    )

    deleted_count = 0
    try:
        # Paginación (S3 devuelve resultados en lotes de máximo 1000)
        paginator = s3_client.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=settings.R2_BUCKET_NAME)

        for page in pages:
            if "Contents" in page:
                objects_to_delete = [{"Key": obj["Key"]} for obj in page["Contents"]]

                # Borramos el lote actual
                if objects_to_delete:
                    response = s3_client.delete_objects(
                        Bucket=settings.R2_BUCKET_NAME,
                        Delete={"Objects": objects_to_delete},
                    )
                    deleted_count += len(response.get("Deleted", []))

        logger.info(
            f"✅ [R2_PURGE] Exterminio completado. Archivos borrados: {deleted_count}"
        )
        return {
            "status": "success",
            "message": f"Bucket purgado con éxito. Se borraron {deleted_count} archivos.",
        }

    except Exception as e:
        logger.error(f"❌ [R2_PURGE] Fallo crítico durante la aniquilación: {e}")
        raise HTTPException(
            status_code=500, detail=f"Fallo al purgar Cloudflare R2: {str(e)}"
        )
