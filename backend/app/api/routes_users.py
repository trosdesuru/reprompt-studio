import logging
from fastapi import APIRouter, Depends, Response, HTTPException
from sqlmodel import Session, select, func
from app.core.config import settings
from app.core.db import get_session
from app.api.deps import get_current_user
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.utils.storage import eliminar_de_r2
from app.models.user import User
from app.models.prompt import ImagePrompt
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

    if data.avatar_url and not data.avatar_url.startswith(
        settings.R2_PUBLIC_URL.rstrip("/")
    ):
        raise HTTPException(status_code=400, detail="URL de avatar no permitida.")

    if current_user.avatar_url and current_user.avatar_url != data.avatar_url:
        try:
            eliminar_de_r2(current_user.avatar_url)
        except Exception as e:
            logger.warning(
                f"⚠️ No se pudo borrar el avatar antiguo de {current_user.username}: {e}"
            )

    current_user.avatar_url = data.avatar_url
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    AuditService.log_action(
        session, current_user.username, "AVATAR_UPDATE", "Avatar actualizado"
    )

    return {
        "status": "success",
        "message": "Avatar actualizado correctamente",
        "avatar_url": current_user.avatar_url,
    }


@router.put("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    AuthService.change_password(data, current_user, session)
    return {"status": "success", "message": "Contraseña actualizada"}
