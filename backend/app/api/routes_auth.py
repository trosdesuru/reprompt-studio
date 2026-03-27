import secrets
import jwt
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlmodel import Session, select

from app.core.db import get_session
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User, InviteCode, AuditLog
from app.schemas.user import UserRegister, UserLogin, Token, PasswordChange
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
)

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
    user = session.exec(select(User).where(User.username == user_data.username)).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.username})

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

    return {"status": "success", "message": f"Bienvenido, {user.username}"}


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


@router.post("/refresh")
def refresh_access_token(response: Response, refresh_token: str | None = Cookie(None)):
    """Genera un nuevo access_token si el refresh_token es válido"""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token no proporcionado")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")

        if username is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")

        new_access_token = create_access_token(data={"sub": username, "role": "admin"})

        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            max_age=60 * 15,
            samesite="lax",
            secure=False,
            path="/",
        )

        return {"status": "success", "message": "Token renovado"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, detail="Refresh token expirado. Vuelve a iniciar sesión."
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="No se pudo validar el token.")
