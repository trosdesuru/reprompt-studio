import logging
from fastapi import APIRouter, Depends, Response, Cookie, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session
from app.core.db import get_session
from app.api.deps import RateLimiter
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.schemas.user import UserRegister, UserLogin
from app.api.auth_utils import COOKIE_PARAMS, redis_client

logger = logging.getLogger("routes_auth")
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
