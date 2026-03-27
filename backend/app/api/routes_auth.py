from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.user import User, InviteCode
from app.schemas.user import UserRegister, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()


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

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False,
        path="/"
    )

    return {"status": "success", "message": f"Bienvenido, {user.username}"}


@router.post("/logout")
def logout_user(response: Response):
    """Destruye la sesión eliminando la cookie del navegador"""
    response.delete_cookie("access_token")
    return {"status": "success", "message": "Sesión cerrada"}
