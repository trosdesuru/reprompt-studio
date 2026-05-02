import logging

from sqlmodel import Session, select, func
from fastapi import APIRouter, Depends, Response, HTTPException

from app.core.config import settings
from app.core.db import get_session
from app.api.deps import get_current_user
from app.services.storage import move_to_permanent
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.utils.storage import eliminar_de_r2
from app.schemas.user import AccountDeleteRequest
from app.models.user import User, InviteCode
from app.models.prompt import ImagePrompt
from app.models.directory import Directory
from app.schemas.user import AvatarUpdate, UsernameUpdate, PasswordChange
from app.api.auth_utils import COOKIE_PARAMS, redis_client

logger = logging.getLogger("routes_users")
router = APIRouter()


@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    count_statement = select(func.count(ImagePrompt.id)).where(
        ImagePrompt.user_id == current_user.id
    )
    prompts_count = session.exec(count_statement).one()

    user_data = current_user.model_dump()
    user_data["prompts_count"] = prompts_count
    user_data["avatarUrl"] = current_user.avatar_url

    return {
        "status": "success",
        "data": user_data,
    }


@router.patch("/me/username")
def change_my_username(
    data: UsernameUpdate,
    response: Response,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    new_name, new_access, new_refresh = AuthService.update_username(
        current_user, data.new_username, session, redis_client
    )

    if new_access and new_refresh:
        response.set_cookie(
            key="access_token", value=new_access, max_age=60 * 15, **COOKIE_PARAMS
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            max_age=60 * 60 * 24 * 7,
            **COOKIE_PARAMS,
        )

    return {
        "status": "success",
        "new_username": new_name,
        "message": "Identidad actualizada correctamente",
    }


@router.patch("/me/avatar")
def update_my_avatar(
    data: AvatarUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not data.avatar_url:
        raise HTTPException(status_code=400, detail="Se requiere una URL de avatar.")

    base_url = settings.R2_PUBLIC_URL.rstrip("/")

    if not data.avatar_url.startswith(base_url):
        raise HTTPException(status_code=400, detail="URL de avatar no permitida.")

    updated_user = AuthService.update_avatar(current_user, data.avatar_url, session)

    AuditService.log_action(
        session,
        updated_user.username,
        "AVATAR_UPDATE",
        "Avatar actualizado, auditado y consolidado",
    )

    return {
        "status": "success",
        "message": "Avatar actualizado correctamente",
        "avatar_url": updated_user.avatar_url,
    }


@router.delete("/me")
def delete_my_account(
    data: AccountDeleteRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Botón Nuclear: Elimina cuenta, limpiando todas las claves foráneas en Neon DB,
    archivos en R2, sesiones en Redis y cookies.
    """
    logger.info(
        f"☢️ [DANGER ZONE] Iniciando borrado bottom-up para: {current_user.username}"
    )

    if data.username_confirm != current_user.username:
        raise HTTPException(status_code=400, detail="El nombre de usuario no coincide.")

    if current_user.avatar_url:
        try:
            eliminar_de_r2(current_user.avatar_url)
        except Exception as e:
            logger.error(f"⚠️ Error borrando avatar: {e}")

    prompts = session.exec(
        select(ImagePrompt).where(ImagePrompt.user_id == current_user.id)
    ).all()
    for prompt in prompts:
        if prompt.image_url:
            try:
                eliminar_de_r2(prompt.image_url)
            except Exception as e:
                pass
        session.delete(prompt)

    invite = session.exec(
        select(InviteCode).where(InviteCode.used_by_id == current_user.id)
    ).first()
    if invite:
        invite.used_by_id = None
        session.add(invite)

    directories = session.exec(
        select(Directory).where(Directory.user_id == current_user.id)
    ).all()
    for directory in directories:
        session.delete(directory)

    AuditService.log_action(
        session,
        current_user.username,
        "ACCOUNT_DELETED",
        "Cuenta eliminada en cascada manual",
    )

    try:
        from app.api.auth_utils import redis_client

        AuthService.revoke_all_sessions(current_user.username, redis_client)
    except Exception:
        pass

    session.delete(current_user)
    session.commit()

    from app.api.auth_utils import COOKIE_PARAMS

    response.delete_cookie("access_token", **COOKIE_PARAMS)
    response.delete_cookie("refresh_token", **COOKIE_PARAMS)

    logger.info(f"✅ [DANGER ZONE] Cuenta {current_user.username} purgada con éxito.")

    return {
        "status": "success",
        "message": "Tu cuenta y todos tus datos han sido eliminados permanentemente.",
    }
