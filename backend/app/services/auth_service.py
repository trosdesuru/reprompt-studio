import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

from jose import jwt
from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.user import User, InviteCode
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
)


class AuthService:

    @staticmethod
    def register_user(user_data, session: Session):
        """Lógica de negocio pura para registrar un usuario."""
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

        return new_user

    @staticmethod
    def change_password(data, current_user: User, session: Session):
        """Lógica para cambiar contraseñas."""
        if not verify_password(data.old_password, current_user.hashed_password):
            raise HTTPException(
                status_code=400, detail="La contraseña actual es incorrecta"
            )

        current_user.hashed_password = get_password_hash(data.new_password)
        session.add(current_user)
        session.commit()

    @staticmethod
    def get_active_sessions(username: str, redis_client):
        """Consulta Redis para obtener sesiones de un usuario."""
        prefix = f"session:{username}:*"
        keys = redis_client.keys(prefix)
        sessions = []
        for key in keys:
            family_id = key.split(":")[-1]
            sessions.append(
                {"family_id": family_id, "last_active_jti": redis_client.get(key)}
            )
        return sessions

    @staticmethod
    def revoke_all_sessions(username: str, redis_client):
        """Botón del pánico: borra todas las sesiones de Redis."""
        prefix = f"session:{username}:*"
        keys = redis_client.keys(prefix)
        if keys:
            redis_client.delete(*keys)

    @staticmethod
    def authenticate_user(user_data, session: Session, redis_client):
        # ... (Mantén el código original de authenticate_user que ya tenías) ...
        user = session.exec(
            select(User).where(User.username == user_data.username)
        ).first()
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(
                status_code=401, detail="Usuario o contraseña incorrectos"
            )

        access_token = create_access_token(
            data={"sub": user.username, "role": user.role}
        )
        refresh_data = create_refresh_token(data={"sub": user.username})

        redis_key = f"session:{user.username}:{refresh_data['family_id']}"
        redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])

        return access_token, refresh_data["token"], user.username

    @staticmethod
    def rotate_tokens(refresh_token: str, session: Session, redis_client):
        # ... (Mantén el código original de rotate_tokens que ya tenías) ...
        if not refresh_token:
            raise HTTPException(status_code=401, detail="No hay token de refresco")

        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            username, jti, family_id = (
                payload.get("sub"),
                payload.get("jti"),
                payload.get("family"),
            )

            if not all([username, jti, family_id]) or payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=401, detail="Estructura de token inválida"
                )

            redis_key = f"session:{username}:{family_id}"
            active_jti = redis_client.get(redis_key)

            if active_jti and active_jti != jti:
                redis_client.delete(redis_key)
                raise HTTPException(
                    status_code=403, detail="ALERTA: Robo de sesión detectado."
                )

            if not active_jti:
                raise HTTPException(
                    status_code=401, detail="Sesión expirada o cerrada remotamente."
                )

            user = session.exec(select(User).where(User.username == username)).first()
            if not user:
                raise HTTPException(status_code=401, detail="Usuario no encontrado")

            new_access_token = create_access_token(
                data={"sub": username, "role": user.role}
            )
            new_refresh_data = create_refresh_token(
                data={"sub": username}, family_id=family_id
            )

            redis_client.setex(redis_key, 60 * 60 * 24 * 7, new_refresh_data["jti"])

            return new_access_token, new_refresh_data["token"]

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401, detail="Token expirado. Inicia sesión."
            )
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Firma inválida.")

    @staticmethod
    def verify_google_token(token: str):
        """Verifica criptográficamente el JWT contra los servidores de Google"""
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=500, detail="Falta configurar GOOGLE_CLIENT_ID en el servidor")
        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), GOOGLE_CLIENT_ID
            )
            return idinfo
        except ValueError:
            raise HTTPException(status_code=401, detail="Token de Google inválido o expirado")

    @staticmethod
    def authenticate_google_user(token: str, session: Session, redis_client):
        """Flujo de decisión: ¿Existe el usuario o es nuevo?"""
        idinfo = AuthService.verify_google_token(token)
        email = idinfo.get("email")
        name = idinfo.get("name", "").replace(" ", "").lower()

        # Buscamos si ya existe alguien con este correo
        user = session.exec(select(User).where(User.email == email)).first()

        if user:
            # ESCENARIO A: Ya existe. Generamos sesión silenciosamente.
            access_token = create_access_token(data={"sub": user.username, "role": user.role})
            refresh_data = create_refresh_token(data={"sub": user.username})

            redis_key = f"session:{user.username}:{refresh_data['family_id']}"
            redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])

            return {
                "status": "success", 
                "access_token": access_token, 
                "refresh_token": refresh_data["token"], 
                "username": user.username
            }
        else:
            # ESCENARIO B: Es nuevo. Cortamos el flujo y pedimos invitación.
            # Sugerimos un nombre de usuario basado en su nombre de Google
            return {
                "status": "needs_invite", 
                "email": email, 
                "suggested_username": name
            }

    @staticmethod
    def register_google_user(join_data, session: Session, redis_client):
        """El usuario nuevo nos ha dado su código de invitación. Lo registramos."""
        # 1. Volvemos a validar el token de Google por seguridad extrema
        idinfo = AuthService.verify_google_token(join_data.token)
        email = idinfo.get("email")
        provider_id = idinfo.get("sub")

        # 2. Verificamos que el Alias que eligió no esté cogido
        user_exists = session.exec(select(User).where(User.username == join_data.username)).first()
        if user_exists:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso. Elige otro.")

        # 3. Validar código de invitación (El Muro Físico)
        statement = select(InviteCode).where(InviteCode.code == join_data.invite_code).where(InviteCode.is_used == False)
        invite = session.exec(statement).first()

        if not invite:
            raise HTTPException(status_code=400, detail="Código de invitación inválido o ya fue utilizado")

        assigned_role = "admin" if invite.code.startswith("TROYA-") else "voyager"

        # 4. Crear el usuario en PostgreSQL
        new_user = User(
            username=join_data.username,
            email=email,
            auth_provider="google",
            provider_id=provider_id,
            role=assigned_role,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # 5. Quemar la invitación para que no se re-use
        invite.is_used = True
        invite.used_by_id = new_user.id
        session.add(invite)
        session.commit()

        # 6. Crear la sesión en Redis
        access_token = create_access_token(data={"sub": new_user.username, "role": new_user.role})
        refresh_data = create_refresh_token(data={"sub": new_user.username})

        redis_key = f"session:{new_user.username}:{refresh_data['family_id']}"
        redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])
        
        return access_token, refresh_data["token"], new_user.username