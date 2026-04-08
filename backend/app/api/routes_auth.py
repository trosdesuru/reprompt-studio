import os
import secrets
import redis
import logging
import urllib.parse
from app.core.config import settings
from app.schemas.user import GoogleAuthRequest
from app.schemas.user import DiscordAuthRequest
from fastapi import APIRouter, Depends, Response, Cookie, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.core.db import get_session
from app.api.deps import get_current_user, get_current_admin, RateLimiter
from app.models.user import User, InviteCode, AuditLog

from app.schemas.user import (
    UserRegister,
    UserLogin,
    PasswordChange,
    GoogleAuthRequest,
    GoogleJoinRequest,
)

IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

logger = logging.getLogger("routes_auth")
redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
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
            detail=f"La cuenta '{user_data.username}' está bloqueada temporalmente por seguridad. Inténtalo en 5 minutos.",
        )

    try:
        access_token, refresh_token, username = AuthService.authenticate_user(
            user_data, session, redis_client
        )
    except HTTPException as e:
        raise e

    redis_client.delete(user_key)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 15,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        path="/",
    )

    AuditService.log_action(session, username, "LOGIN", "Inicio de sesión exitoso")
    return {"status": "success", "message": f"Bienvenido, {username}"}


@router.get("/google/url")
def get_google_auth_url():
    """Genera la URL para que el frontend redirija al usuario a Google"""
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "response_type": "code",
        "scope": "openid email profile",
        # Asegúrate de que esta URL coincida con la que tienes en Google Cloud Console
        "redirect_uri": "http://localhost:3000/es/google/callback",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return {"auth_url": url}


# 🟢 RUTA 2: El Callback que recibe el Code y hace la magia
@router.post("/google/callback")
def verify_google_code(
    data: GoogleAuthRequest, response: Response, session: Session = Depends(get_session)
):
    # Aquí llamamos al AuthService que creamos en el paso anterior
    result = AuthService.authenticate_google_user(
        data.code, data.redirect_uri, session, redis_client
    )

    if result["status"] == "needs_invite":
        response.status_code = status.HTTP_202_ACCEPTED
        return result

    # Configurar cookies si el login es exitoso
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 15,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        path="/",
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
    # Llamamos al servicio que ya tenías creado
    access_token, refresh_token, username = AuthService.register_google_user(
        data, session, redis_client
    )

    # Inyectamos las cookies de sesión (igual que en el login normal)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 15,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        path="/",
    )
    return {
        "status": "success",
        "message": f"Cuenta VIP creada con éxito. Bienvenido, {username}",
    }


@router.get("/discord/url")
def get_discord_auth_url():
    """Genera la URL para que el frontend redirija al usuario a Discord"""
    base_url = "https://discord.com/api/oauth2/authorize"
    params = {
        "client_id": settings.DISCORD_CLIENT_ID,
        "redirect_uri": "http://localhost:3000/es/discord/callback",
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

    # Configurar cookies
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 15,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=IS_PRODUCTION,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        path="/",
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
    response.delete_cookie(
        "access_token", path="/", httponly=True, samesite="lax", secure=IS_PRODUCTION
    )
    response.delete_cookie(
        "refresh_token", path="/", httponly=True, samesite="lax", secure=IS_PRODUCTION
    )

    if refresh_token:
        try:
            from jose import jwt
            from app.core.security import SECRET_KEY, ALGORITHM

            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            family_id = payload.get("family")

            if username and family_id:
                redis_key = f"session:{username}:{family_id}"
                redis_client.delete(redis_key)
        except Exception:
            pass

    return {"status": "success", "message": "Sesión cerrada y destruida por completo"}


@router.put("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    AuthService.change_password(data, current_user, session)
    return {"status": "success", "message": "Contraseña actualizada correctamente"}


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


@router.post("/refresh")
def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(None),
    session: Session = Depends(get_session),
):
    logger.info("🌐 [API_AUTH] Petición POST recibida en /api/auth/refresh")

    if refresh_token:
        logger.info(
            f"🍪 [API_AUTH] Cookie 'refresh_token' detectada (Termina en: ...{refresh_token[-6:]})"
        )
    else:
        logger.warning(
            "🍪 [API_AUTH] NO SE DETECTÓ cookie 'refresh_token' en la petición."
        )

    try:
        new_access, new_refresh = AuthService.rotate_tokens(
            refresh_token, session, redis_client
        )

        logger.info(
            "📦 [API_AUTH] Inyectando nuevos tokens en las cookies de respuesta..."
        )
        response.set_cookie(
            key="access_token",
            value=new_access,
            httponly=True,
            secure=IS_PRODUCTION,
            max_age=60 * 15,
            samesite="lax",
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            httponly=True,
            secure=IS_PRODUCTION,
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            path="/",
        )
        logger.info("✅ [API_AUTH] Ciclo de /refresh completado y enviado al cliente.")
        return {"status": "success", "message": "Tokens rotados"}

    except HTTPException as e:
        logger.warning(
            f"🛑 [API_AUTH] /refresh abortado con código {e.status_code}: {e.detail}"
        )

        if e.status_code in [401, 403]:
            logger.info(
                "🧹 [API_AUTH] Limpiando cookies del navegador (Sesión muerta)..."
            )

            error_response = JSONResponse(
                status_code=e.status_code,
                content={"status": "error", "detail": e.detail},
            )
            error_response.delete_cookie(
                "access_token",
                path="/",
                httponly=True,
                samesite="lax",
                secure=IS_PRODUCTION,
            )
            error_response.delete_cookie(
                "refresh_token",
                path="/",
                httponly=True,
                samesite="lax",
                secure=IS_PRODUCTION,
            )

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
    new_invite = InviteCode(code=new_code_str)
    session.add(new_invite)
    session.commit()
    return {"status": "success", "message": "Código generado", "code": new_code_str}


@router.get("/admin/sessions")
def list_active_sessions(current_admin: User = Depends(get_current_admin)):
    sessions = AuthService.get_active_sessions(current_admin.username, redis_client)
    return {"status": "success", "sessions": sessions}


@router.post("/admin/sessions/revoke-all")
def revoke_all_sessions(current_admin: User = Depends(get_current_admin)):
    AuthService.revoke_all_sessions(current_admin.username, redis_client)
    return {"status": "success", "message": "Todas las sesiones han sido revocadas."}
