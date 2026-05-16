import logging
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from sqlmodel import select, Session, func, delete, text
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from app.api.deps import get_current_admin, get_session
from app.models.user import User, AuditLog, InviteCode, UserRole
from app.models.directory import Directory
from app.models.gallery import GalleryMetric
from app.models.prompt import ImagePrompt

from app.core.security import get_password_hash
from app.core.redis_config import conn as redis_client
from app.core.config import settings

from app.services.audit_service import AuditService
from app.services.storage import s3_client
from app.services.auth_service import AuthService

router = APIRouter()
logger = logging.getLogger("backend")

USER_NOT_FOUND = "Usuario no encontrado"

ActiveAdmin = Annotated[User, Depends(get_current_admin)]
DbSession = Annotated[Session, Depends(get_session)]


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


def sanitize_log(value: str) -> str:
    if not value:
        return ""
    return value.replace("\n", " ").replace("\r", " ").strip()


@router.post("/bugs")
async def receive_bug_report(report: BugReport, request: Request):
    client_ip = (
        sanitize_log(request.client.host) if request.client else "IP Desconocida"
    )

    safe_url = sanitize_log(report.url)
    safe_msg = sanitize_log(report.message)
    safe_timestamp = sanitize_log(report.timestamp)

    logger.critical("=" * 60)
    logger.critical("NUEVO BUG REPORTADO A Trosdesuru")

    logger.critical(f"Origen: {safe_url} (IP: {client_ip})")
    logger.critical(f"Timestamp: {safe_timestamp}")
    logger.critical(f"Mensaje: {safe_msg}")

    if report.stack:
        safe_stack = sanitize_log(report.stack[:600])
        logger.critical(f"📚 Stacktrace (Escapado): {safe_stack}...")

    logger.critical("=" * 60)

    return {
        "status": "success",
        "message": "Reporte interceptado con éxito en la base.",
    }


@router.get("/database-stats")
def get_db_stats(current_admin: ActiveAdmin, session: DbSession):
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


@router.get("/storage-stats", responses={500: {"description": "Fallo de conexión R2"}})
def get_storage_stats(current_admin: ActiveAdmin):
    try:
        response = s3_client.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
        archivos = response.get("Contents", [])
        peso_total_bytes = sum(f["Size"] for f in archivos)
        total_mb = round(peso_total_bytes / (1024 * 1024), 2)

        return {"status": "success", "total_files": len(archivos), "total_mb": total_mb}
    except Exception:
        logger.exception("❌ Error leyendo R2")
        raise HTTPException(
            status_code=500, detail="Fallo de conexión con Cloudflare R2"
        )


@router.post("/garbage-collect", responses={500: {"description": "Error en purga"}})
def run_garbage_collector(current_admin: ActiveAdmin, session: DbSession):
    logger.info(
        f"🧹 [GARBAGE_COLLECTOR] Protocolo iniciado por: {current_admin.username}"
    )

    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    one_day_ago = now - timedelta(days=1)

    try:
        deleted_logs = session.exec(
            delete(AuditLog).where(AuditLog.timestamp < thirty_days_ago)
        ).rowcount
        deleted_invites = session.exec(
            delete(InviteCode).where(
                InviteCode.is_used.is_(True), InviteCode.created_at < thirty_days_ago
            )
        ).rowcount
        session.commit()
    except Exception:
        session.rollback()
        logger.exception("❌ [GARBAGE_COLLECTOR] Fallo crítico en la DB")
        raise HTTPException(status_code=500, detail="Fallo en la purga de PostgreSQL")

    deleted_temp_files = 0
    try:
        response = s3_client.list_objects_v2(
            Bucket=settings.R2_BUCKET_NAME, Prefix="temp/"
        )
        if "Contents" in response:
            to_delete = [
                {"Key": o["Key"]}
                for o in response["Contents"]
                if o["LastModified"] < one_day_ago
            ]
            if to_delete:
                for i in range(0, len(to_delete), 1000):
                    s3_client.delete_objects(
                        Bucket=settings.R2_BUCKET_NAME,
                        Delete={"Objects": to_delete[i : i + 1000]},
                    )
                deleted_temp_files = len(to_delete)
    except Exception:
        logger.exception("❌ [GARBAGE_COLLECTOR] Fallo crítico en R2")

    return {
        "status": "success",
        "deleted_logs": deleted_logs,
        "deleted_invites": deleted_invites,
        "deleted_temp_files": deleted_temp_files,
    }


@router.post(
    "/users/action",
    responses={
        404: {"description": USER_NOT_FOUND},
        403: {"description": "Acceso denegado"},
        400: {"description": "Acción inválida"},
    },
)
def manage_user_action(
    data: UserActionRequest, current_admin: ActiveAdmin, session: DbSession
):
    target_user = session.get(User, data.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

    if target_user.role == UserRole.ADMIN and current_admin.id != target_user.id:
        raise HTTPException(
            status_code=403, detail="No puedes modificar a otro administrador."
        )

    if data.action == "upgrade":
        target_user.role = UserRole.ARTIST
        msg = "Usuario ascendido a Artist VIP."
    elif data.action == "deactivate":
        target_user.is_active = False
        msg = "Cuenta desactivada (Shadowban)."
    elif data.action == "activate":
        target_user.is_active = True
        msg = "Cuenta reactivada."
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
    AuditService.log_action(
        session,
        current_admin.username,
        f"USER_{data.action.upper()}",
        f"Afectado: @{target_user.username}",
    )
    return {"status": "success", "message": msg}


@router.delete(
    "/users/{user_id}",
    responses={
        404: {"description": USER_NOT_FOUND},
        403: {"description": "Acción prohibida"},
        500: {"description": "Error servidor"},
    },
)
def delete_user_completely(
    user_id: str,
    background_tasks: BackgroundTasks,
    current_admin: ActiveAdmin,
    session: DbSession,
):
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

    if target_user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="No se puede borrar a un administrador."
        )

    try:
        prompts = session.exec(
            select(ImagePrompt).where(ImagePrompt.user_id == target_user.id)
        ).all()
        image_urls_to_delete = [p.image_url for p in prompts if p.image_url]

        if image_urls_to_delete:
            background_tasks.add_task(purge_r2_images_batch, image_urls_to_delete)

        invites = session.exec(
            select(InviteCode).where(InviteCode.used_by_id == target_user.id)
        ).all()
        for inv in invites:
            inv.used_by_id = None
            session.add(inv)

        session.exec(
            delete(GalleryMetric).where(GalleryMetric.user_id == target_user.id)
        )
        session.exec(delete(ImagePrompt).where(ImagePrompt.user_id == target_user.id))
        session.exec(delete(Directory).where(Directory.user_id == target_user.id))
        session.delete(target_user)
        session.commit()

        AuditService.log_action(
            session,
            current_admin.username,
            "USER_DELETED",
            f"Exterminado: @{target_user.username}",
        )
        return {
            "status": "success",
            "message": f"Usuario @{target_user.username} exterminado.",
        }

    except Exception:
        session.rollback()
        logger.exception("Error crítico en exterminio de usuario")
        raise HTTPException(
            status_code=500, detail="Fallo al ejecutar el exterminio en cascada."
        )


@router.get(
    "/users/{user_id}/activity", responses={404: {"description": USER_NOT_FOUND}}
)
def get_user_activity(user_id: str, current_admin: ActiveAdmin, session: DbSession):
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

    is_online = False
    try:
        if redis_client.exists(f"user:online:{target_user.id}"):
            is_online = True
    except Exception:
        logger.warning("Error consultando estado online en Redis")

    logs = session.exec(
        select(AuditLog)
        .where(AuditLog.username == target_user.username)
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
    ).all()

    return {"status": "success", "is_online": is_online, "logs": logs}


def purge_r2_images_batch(image_urls: list):
    """Borra múltiples archivos de R2 en lote"""

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    objects_to_delete = [
        {"Key": url.replace(base_url + "/", "")}
        for url in image_urls
        if url.startswith(base_url)
    ]

    if objects_to_delete:
        for i in range(0, len(objects_to_delete), 1000):
            try:
                s3_client.delete_objects(
                    Bucket=settings.R2_BUCKET_NAME,
                    Delete={"Objects": objects_to_delete[i : i + 1000]},
                )
            except Exception:
                logger.exception("Fallo silenciado en purga batch de R2")


@router.post(
    "/storage/purge-all", responses={500: {"description": "Fallo en aniquilación"}}
)
def purge_entire_r2_bucket(current_admin: ActiveAdmin, session: DbSession):
    logger.warning(
        f"☢️ [R2_PURGE] Protocolo de aniquilación iniciado por: {current_admin.username}"
    )
    deleted_count = 0
    try:
        paginator = s3_client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=settings.R2_BUCKET_NAME):
            if "Contents" in page:
                objs = [{"Key": obj["Key"]} for obj in page["Contents"]]
                if objs:
                    response = s3_client.delete_objects(
                        Bucket=settings.R2_BUCKET_NAME, Delete={"Objects": objs}
                    )
                    deleted_count += len(response.get("Deleted", []))

        return {
            "status": "success",
            "message": f"Bucket purgado. {deleted_count} archivos eliminados.",
        }
    except Exception:
        logger.exception("❌ [R2_PURGE] Fallo crítico durante la aniquilación")
        raise HTTPException(status_code=500, detail="Fallo al purgar Cloudflare R2")


@router.get("/logs")
def get_audit_logs(current_admin: ActiveAdmin, session: DbSession, limit: int = 50):
    statement = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    logs = session.exec(statement).all()
    return {"status": "success", "logs": logs}


@router.post("/invite-codes", responses={500: {"description": "Error DB"}})
def generate_invite_code(
    current_admin: ActiveAdmin, session: DbSession, role_requested: str = "voyager"
):
    prefix = "VGR" if role_requested == "voyager" else "ART"
    new_code_str = f"{prefix}-{secrets.token_hex(4).upper()}"

    try:
        new_invite = InviteCode(code=new_code_str)
        session.add(new_invite)
        session.commit()
        session.refresh(new_invite)
        AuditService.log_action(
            session,
            current_admin.username,
            "INVITE_CREATED",
            f"Generado código {role_requested.upper()}: {new_code_str}",
        )
        return {"status": "success", "message": "Código generado", "code": new_code_str}
    except Exception:
        session.rollback()
        logger.exception("❌ Fallo al insertar InviteCode")
        raise HTTPException(status_code=500, detail="Error de base de datos")


@router.get("/invites")
def list_invite_codes(current_admin: ActiveAdmin, session: DbSession):
    statement = (
        select(InviteCode)
        .where(InviteCode.is_used.is_(False))
        .order_by(InviteCode.created_at.desc())
    )
    invites = session.exec(statement).all()
    return {"status": "success", "invites": invites}


@router.get("/sessions")
def list_active_sessions(current_admin: ActiveAdmin):
    sessions = AuthService.get_active_sessions(current_admin.username, redis_client)
    return {"status": "success", "sessions": sessions}


@router.post("/sessions/revoke-all")
def revoke_all_sessions(current_admin: ActiveAdmin):
    AuthService.revoke_all_sessions(current_admin.username, redis_client)
    return {"status": "success", "message": "Todas las sesiones han sido revocadas."}
