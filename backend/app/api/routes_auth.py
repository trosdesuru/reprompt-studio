import secrets
import redis
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlmodel import Session, select

from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.core.db import get_session
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User, InviteCode, AuditLog
from app.schemas.user import UserRegister, UserLogin, PasswordChange
from app.core.security import (
    get_password_hash,
    verify_password,
    SECRET_KEY,
    ALGORITHM,
)

# Conexión directa al contenedor Redis de tu docker-compose
redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
router = APIRouter()


@router.get("/admin/logs")
def get_audit_logs(
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),  # 🛡️ Solo para Admins
    session: Session = Depends(get_session),
):
    """Devuelve los últimos logs de actividad de la plataforma"""
    statement = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    logs = session.exec(statement).all()

    return {"status": "success", "logs": logs}


@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Devuelve los datos del usuario logueado usando su Cookie"""
    return {
        "status": "success",
        "user": {
            "username": current_user.username,
            "role": current_user.role,
            "is_active": current_user.is_active,
        },
    }


@router.post("/register")
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    statement = (
        select(InviteCode)
        .where(InviteCode.code == user_data.invite_code)
        .where(InviteCode.is_used == False)
    )
    invite = session.exec(statement).first()

    if not invite:
        raise HTTPException(
            status_code=400, detail="Código de invitación inválido o ya usado"
        )

    user_exists = session.exec(
        select(User).where(User.username == user_data.username)
    ).first()
    if user_exists:
        raise HTTPException(
            status_code=400, detail="El nombre de usuario ya está en uso"
        )

    assigned_role = "admin" if invite.code.startswith("TROYA-") else "voyager"

    new_user = User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        role=assigned_role,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    invite.is_used = True
    invite.used_by_id = new_user.id
    session.add(invite)
    session.commit()

    return {
        "status": "success",
        "message": f"Usuario registrado correctamente",
        "user": {"username": new_user.username, "role": new_user.role},
    }


@router.post("/login")
def login_user(
    user_data: UserLogin, response: Response, session: Session = Depends(get_session)
):
    # 1. Toda la lógica de validación y generación vive en el servicio
    access_token, refresh_token, username = AuthService.authenticate_user(
        user_data, session, redis_client
    )

    # 2. El router SOLO se encarga de setear las cookies HTTP (Su verdadera responsabilidad)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 15,
        samesite="lax",
        secure=False,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False,
        path="/api/auth/refresh",
    )

    # Registramos el login (Opcional, pero buena práctica)
    AuditService.log_action(session, username, "LOGIN", "Inicio de sesión exitoso")

    return {"status": "success", "message": f"Bienvenido, {username}"}


@router.post("/logout")
def logout_user(response: Response):
    """Destruye la sesión eliminando la cookie del navegador"""
    response.delete_cookie("access_token")
    return {"status": "success", "message": "Sesión cerrada"}


@router.put("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400, detail="La contraseña actual es incorrecta"
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    session.add(current_user)
    session.commit()

    return {"status": "success", "message": "Contraseña actualizada correctamente"}


@router.post("/invite-codes")
def generate_invite_code(
    role_requested: str = "voyager",
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Genera un nuevo código de invitación de un solo uso"""
    prefix = "VGR" if role_requested == "voyager" else "ART"

    new_code_str = f"{prefix}-{secrets.token_hex(4).upper()}"

    new_invite = InviteCode(code=new_code_str)
    session.add(new_invite)
    session.commit()

    return {
        "status": "success",
        "message": "Código de invitación generado",
        "code": new_code_str,
    }


@router.get("/admin/sessions")
def list_active_sessions(current_user: User = Depends(get_current_user)):
    """Lista todas las familias de sesiones activas del usuario en Redis"""
    # Buscamos todas las llaves que empiecen por session:username:*
    prefix = f"session:{current_user.username}:*"
    keys = redis_client.keys(prefix)

    sessions = []
    for key in keys:
        family_id = key.split(":")[-1]
        sessions.append(
            {"family_id": family_id, "last_active_jti": redis_client.get(key)}
        )
    return {"status": "success", "sessions": sessions}


@router.post("/admin/sessions/revoke-all")
def revoke_all_sessions(current_user: User = Depends(get_current_user)):
    """Borra TODAS las sesiones del usuario en Redis (Botón del Pánico)"""
    prefix = f"session:{current_user.username}:*"
    keys = redis_client.keys(prefix)
    if keys:
        redis_client.delete(*keys)
    return {"status": "success", "message": "Todas las sesiones han sido revocadas."}


@router.post("/refresh")
def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(None),
    session: Session = Depends(get_session),
):
    try:
        # El servicio se encarga de la mutación y comprobación de brechas
        new_access, new_refresh = AuthService.rotate_tokens(
            refresh_token, session, redis_client
        )

        response.set_cookie(
            key="access_token",
            value=new_access,
            httponly=True,
            max_age=60 * 15,
            samesite="lax",
            secure=False,
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            httponly=True,
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            secure=False,
            path="/api/auth/refresh",
        )

        return {"status": "success", "message": "Tokens rotados"}
    except HTTPException as e:
        # Si hay brecha de seguridad, el router limpia las cookies
        if e.status_code == 403:
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token", path="/api/auth/refresh")
        raise e
