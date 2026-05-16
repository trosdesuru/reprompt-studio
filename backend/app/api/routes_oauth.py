import urllib.parse

from typing import Annotated
from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session
from app.core.config import settings
from app.core.db import get_session
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.api.auth_utils import FRONTEND_URL, COOKIE_PARAMS, redis_client
from app.schemas.user import GoogleAuthRequest, GoogleJoinRequest, DiscordAuthRequest

router = APIRouter()


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
    data: GoogleAuthRequest,
    response: Response,
    session: Annotated[Session, Depends(get_session)],
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
    session: Annotated[
        Session,
        Depends(get_session),
    ],
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
    session: Annotated[
        Session,
        Depends(get_session),
    ],
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
