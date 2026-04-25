import os
import secrets
import redis
import logging
import urllib.parse
from app.core.config import settings
from app.utils.storage import eliminar_de_r2

from fastapi import APIRouter, Depends, Response, Cookie, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlmodel import Session, select

from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.core.db import get_session
from app.api.deps import get_current_user, get_current_admin, RateLimiter
from app.models.user import User, InviteCode, AuditLog

from app.schemas.user import (
    GoogleAuthRequest,
    GoogleJoinRequest,
    DiscordAuthRequest,
    UserRegister,
    UserLogin,
    AvatarUpdate,
    UsernameUpdate,
    PasswordChange,
)

# --- CONFIGURACIÓN DE ENTORNO ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

COOKIE_PARAMS = {
    "httponly": True,
    "path": "/",
    "secure": IS_PRODUCTION,
    "samesite": "lax",
    "domain": (
        ".reprompt.studio"
        if IS_PRODUCTION or "reprompt.studio" in os.getenv("FRONTEND_URL", "")
        else None
    ),
}

logger = logging.getLogger("routes_auth")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

router = APIRouter()


@router.post("/register")
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    new_user = AuthService.register_user(user_data, session)
    return {
        "status": "success",
        "message": "Usuario registrado correctamente",
        "user": {"username": new_user.username, "role": new_user.role},
    }


@router.post(
    "/login", dependencies=[Depends(RateLimiter(max_requests=5, window_seconds=60))]
)
def login_user(
    user_data: UserLogin, response: Response, session: Session = Depends(get_session)
):
    user_key = f"brute_force_user:{user_data.username}"
    attempts = redis_client.incr(user_key)
    if attempts == 1:
        redis_client.expire(user_key, 300)
    if attempts > 5:
        raise HTTPException(
            status_code=429,
            detail=f"La cuenta '{user_data.username}' está bloqueada temporalmente. Prueba en 5 min.",
        )

    try:
        access_token, refresh_token, username = AuthService.authenticate_user(
            user_data, session, redis_client
        )
    except HTTPException as e:
        raise e

    redis_client.delete(user_key)

    response.set_cookie(
        key="access_token", value=access_token, max_age=60 * 15, **COOKIE_PARAMS
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=60 * 60 * 24 * 7,
        **COOKIE_PARAMS,
    )

    AuditService.log_action(session, username, "LOGIN", "Inicio de sesión exitoso")
    return {"status": "success", "message": f"Bienvenido, {username}"}


@router.get("/google/url")
def get_google_auth_url():
    print("🔴 [DEBUG AUTH] 1. Petición recibida en /google/url")
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": f"{FRONTEND_URL}/es/google/callback",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return {"auth_url": url}


@router.post("/google/callback")
def verify_google_code(
    data: GoogleAuthRequest, response: Response, session: Session = Depends(get_session)
):
    result = AuthService.authenticate_google_user(
        data.code, data.redirect_uri, session, redis_client
    )

    if result["status"] == "needs_invite":
        response.status_code = status.HTTP_202_ACCEPTED
        return result

    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        max_age=60 * 15,
        **COOKIE_PARAMS,
    )
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        max_age=60 * 60 * 24 * 7,
        **COOKIE_PARAMS,
    )

    return {
        "status": "success",
        "message": f"Bienvenido de nuevo, {result['username']}",
    }


@router.post("/google/join")
def register_google_user_route(
    data: GoogleJoinRequest,
    response: Response,
    session: Session = Depends(get_session),
):
    access_token, refresh_token, username = AuthService.register_google_user(
        data, session, redis_client
    )

    response.set_cookie(
        key="access_token", value=access_token, max_age=60 * 15, **COOKIE_PARAMS
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=60 * 60 * 24 * 7,
        **COOKIE_PARAMS,
    )
    return {
        "status": "success",
        "message": f"Cuenta VIP creada. Bienvenido, {username}",
    }


@router.get("/discord/url")
def get_discord_auth_url():
    base_url = "https://discord.com/api/oauth2/authorize"
    params = {
        "client_id": settings.DISCORD_CLIENT_ID,
        "redirect_uri": f"{FRONTEND_URL}/es/discord/callback",
        "response_type": "code",
        "scope": "identify email",
        "prompt": "consent",
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return {"auth_url": url}


@router.post("/discord")
def discord_auth(
    data: DiscordAuthRequest,
    response: Response,
    session: Session = Depends(get_session),
):
    result = AuthService.authenticate_discord_user(
        data.code, data.redirect_uri, session, redis_client
    )

    if result["status"] == "needs_invite":
        response.status_code = status.HTTP_202_ACCEPTED
        return result

    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        max_age=60 * 15,
        **COOKIE_PARAMS,
    )
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        max_age=60 * 60 * 24 * 7,
        **COOKIE_PARAMS,
    )

    AuditService.log_action(
        session, result["username"], "LOGIN_DISCORD", "Inicio de sesión con Discord"
    )
    return {
        "status": "success",
        "message": f"Bienvenido de nuevo, {result['username']}",
    }


@router.post("/logout")
def logout_user(response: Response, refresh_token: str | None = Cookie(None)):
    response.delete_cookie("access_token", **COOKIE_PARAMS)
    response.delete_cookie("refresh_token", **COOKIE_PARAMS)

    if refresh_token:
        try:
            import jwt
            from app.core.security import SECRET_KEY, ALGORITHM

            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            family_id = payload.get("family")
            if username and family_id:
                redis_client.delete(f"session:{username}:{family_id}")
        except Exception:
            pass

    return {"status": "success", "message": "Sesión cerrada correctamente"}


@router.put("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    AuthService.change_password(data, current_user, session)
    return {"status": "success", "message": "Contraseña actualizada"}


@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "user": {
            "username": current_user.username,
            "role": current_user.role,
            "is_active": current_user.is_active,
        },
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
    """
    Actualiza el avatar del usuario.
    Si ya tenía un avatar, destruye el antiguo en Cloudflare R2 para liberar espacio.
    """
    # 1. 🛡️ Sanitización de Seguridad: Asegurar que es un enlace de nuestro bucket
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


@router.post("/refresh")
def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(None),
    session: Session = Depends(get_session),
):
    if not refresh_token:
        logger.warning("🍪 [API_AUTH] No se detectó cookie 'refresh_token'.")

    try:
        new_access, new_refresh = AuthService.rotate_tokens(
            refresh_token, session, redis_client
        )

        response.set_cookie(
            key="access_token", value=new_access, max_age=60 * 15, **COOKIE_PARAMS
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            max_age=60 * 60 * 24 * 7,
            **COOKIE_PARAMS,
        )
        return {"status": "success", "message": "Tokens rotados"}

    except HTTPException as e:
        if e.status_code in [401, 403]:
            error_response = JSONResponse(
                status_code=e.status_code,
                content={"status": "error", "detail": e.detail},
            )
            error_response.delete_cookie("access_token", **COOKIE_PARAMS)
            error_response.delete_cookie("refresh_token", **COOKIE_PARAMS)
            return error_response
        raise e


@router.get("/admin/logs")
def get_audit_logs(
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    statement = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    logs = session.exec(statement).all()
    return {"status": "success", "logs": logs}


@router.post("/invite-codes")
def generate_invite_code(
    role_requested: str = "voyager",
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
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

    except Exception as e:
        session.rollback()
        logger.error(f"❌ Fallo al insertar InviteCode en Neon: {e}")
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")


@router.get("/admin/invites")
def list_invite_codes(
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    statement = (
        select(InviteCode)
        .where(InviteCode.is_used == False)
        .order_by(InviteCode.created_at.desc())
    )
    invites = session.exec(statement).all()

    return {"status": "success", "invites": invites}


@router.get("/admin/sessions")
def list_active_sessions(current_admin: User = Depends(get_current_admin)):
    sessions = AuthService.get_active_sessions(current_admin.username, redis_client)
    return {"status": "success", "sessions": sessions}


@router.post("/admin/sessions/revoke-all")
def revoke_all_sessions(current_admin: User = Depends(get_current_admin)):
    AuthService.revoke_all_sessions(current_admin.username, redis_client)
    return {"status": "success", "message": "Todas las sesiones han sido revocadas."}
