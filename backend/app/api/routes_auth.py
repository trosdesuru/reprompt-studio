# backend/app/api/routes_auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.user import User, InviteCode
from app.schemas.user import UserRegister, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()


@router.post("/register")
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    # 1. Buscar el código de invitación usando la sintaxis moderna (session.exec)
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

    # 2. Verificar que el nombre de usuario esté libre
    user_exists = session.exec(
        select(User).where(User.username == user_data.username)
    ).first()
    if user_exists:
        raise HTTPException(
            status_code=400, detail="El nombre de usuario ya está en uso"
        )

    # 3. Determinar el Rol (El código maestro otorga Admin)
    assigned_role = "admin" if invite.code.startswith("TROYA-") else "voyager"

    # 4. Crear el Usuario
    new_user = User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        role=assigned_role,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # 5. QUEMAR el código de invitación (asociarlo al usuario y marcarlo como usado)
    invite.is_used = True
    invite.used_by_id = new_user.id
    session.add(invite)
    session.commit()

    return {
        "status": "success",
        "message": f"Usuario registrado correctamente",
        "user": {"username": new_user.username, "role": new_user.role},
    }


@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, session: Session = Depends(get_session)):
    # 1. Buscar al usuario en la base de datos
    user = session.exec(select(User).where(User.username == user_data.username)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # 2. Verificar que la contraseña coincide con el Hash
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # 3. Generar el Token VIP (Guardamos el nombre y el rol dentro del token)
    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    return {"access_token": access_token, "token_type": "bearer"}
