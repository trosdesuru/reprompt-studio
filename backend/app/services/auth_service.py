import os
import re
import logging
import requests
from app.core.config import settings
from sqlalchemy import or_
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

        logger = logging.getLogger("auth_service")
        logger.info(f"📝 [AUTH_SERVICE] Intento de registro. Email: {user_data.email}")
        logger.info(f"🔑 [AUTH_SERVICE] Verificando código de invitación: {user_data.invite_code}")

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

        # 2. Validación de usuario existente
        email_exists = session.exec(
            select(User).where(User.email == user_data.email)).first()
        
        if email_exists:
            raise HTTPException(status_code=400, detail="Este correo electrónico ya está registrado.")

        base_username = re.sub(r"[^a-z0-9]", "", user_data.email.split("@")[0].lower())
        if not base_username:
            base_username = (
                "user"  # Fallback extremo por si el email era ".-_@gmail.com"
            )

        username = base_username
        counter = 1

        while session.exec(select(User).where(User.username == username)).first():
            username = f"{base_username}{counter}"
            counter += 1

        # 4. Asignación de rol y creación
        assigned_role = "admin" if invite.code.startswith("TROYA-") else "voyager"

        new_user = User(
            email=user_data.email,
            username=username,
            hashed_password=get_password_hash(user_data.password),
            role=assigned_role,
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # 5. Quema de código
        invite.is_used = True
        invite.used_by_id = new_user.id
        session.add(invite)
        session.commit()

        logger.info(
            f"✨ ¡Usuario registrado! Email: {new_user.email} -> Username asignado: @{new_user.username}"
        )
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
        logger = logging.getLogger("auth_service")
        logger.info(f"🔐 [AUTH] Intentando login local para: {user_data.username}")

        user = session.exec(select(User).where(User.username == user_data.username)).first()
        
        if not user:
            logger.warning(f"❌ [AUTH] Usuario no encontrado en DB: {user_data.username}")
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        if not verify_password(user_data.password, user.hashed_password):
            logger.warning(f"❌ [AUTH] Contraseña incorrecta para: {user_data.username}")
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        logger.info(f"✅ [AUTH] Password verificado. Generando tokens para @{user.username}")

        try:
            access_token = create_access_token(data={"sub": user.username, "role": user.role})
            refresh_data = create_refresh_token(data={"sub": user.username})

            redis_key = f"session:{user.username}:{refresh_data['family_id']}"
            redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])
            
            logger.info(f"🚀 [AUTH] Sesión registrada en Redis. Key: {redis_key}")
            return access_token, refresh_data["token"], user.username
        except Exception as e:
            logger.error(f"💥 [AUTH] Error crítico en el registro de sesión: {str(e)}")
            raise e

    @staticmethod
    def rotate_tokens(refresh_token: str, session: Session, redis_client):
        logger = logging.getLogger("auth_service")
        logger.info("🔄 [AUTH_SERVICE] Iniciando secuencia de rotación de tokens...")

        if not refresh_token:
            logger.warning(
                "🚫 [AUTH_SERVICE] Rotación fallida: No se recibió token de refresco."
            )
            raise HTTPException(status_code=401, detail="No hay token de refresco")

        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            username, jti, family_id = (
                payload.get("sub"),
                payload.get("jti"),
                payload.get("family"),
            )

            logger.info(
                f"🔍 [AUTH_SERVICE] Token decodificado -> User: {username} | JTI: {jti} | Family: {family_id}"
            )

            if not all([username, jti, family_id]) or payload.get("type") != "refresh":
                logger.error(
                    "❌ [AUTH_SERVICE] Rotación fallida: Estructura del token inválida o no es tipo 'refresh'."
                )
                raise HTTPException(
                    status_code=401, detail="Estructura de token inválida"
                )

            redis_key = f"session:{username}:{family_id}"
            active_jti = redis_client.get(redis_key)

            logger.info(
                f"📡 [AUTH_SERVICE] Consultando Redis -> Clave: {redis_key} | JTI Guardado: {active_jti}"
            )

            if active_jti and active_jti != jti:
                logger.warning(
                    f"🚨 [AUTH_SERVICE] ALERTA DE SEGURIDAD (Posible Robo o Doble Petición)."
                )
                logger.warning(f"   -> JTI Recibido: {jti}")
                logger.warning(f"   -> JTI en Redis: {active_jti}")
                redis_client.delete(redis_key)
                logger.info(
                    f"🧹 [AUTH_SERVICE] Sesión {family_id} destruida en Redis por seguridad."
                )
                raise HTTPException(
                    status_code=403, detail="ALERTA: Robo de sesión detectado."
                )

            if not active_jti:
                logger.warning(
                    f"⚠️ [AUTH_SERVICE] Rotación rechazada: La sesión {family_id} ya expiró o fue cerrada remotamente."
                )
                raise HTTPException(
                    status_code=401, detail="Sesión expirada o cerrada remotamente."
                )

            user = session.exec(select(User).where(User.username == username)).first()
            if not user:
                logger.error(
                    f"❌ [AUTH_SERVICE] El usuario {username} existe en el token pero no en la Base de Datos."
                )
                raise HTTPException(status_code=401, detail="Usuario no encontrado")

            # Generación de nuevos tokens
            new_access_token = create_access_token(
                data={"sub": username, "role": user.role}
            )
            new_refresh_data = create_refresh_token(
                data={"sub": username}, family_id=family_id
            )

            # Actualizamos Redis
            redis_client.setex(redis_key, 60 * 60 * 24 * 7, new_refresh_data["jti"])

            logger.info(
                f"✅ [AUTH_SERVICE] Rotación EXITOSA. Nuevo JTI asignado: {new_refresh_data['jti']}"
            )

            return new_access_token, new_refresh_data["token"]

        except jwt.ExpiredSignatureError:
            logger.warning("⏱️ [AUTH_SERVICE] El Refresh Token ha caducado por tiempo.")
            raise HTTPException(
                status_code=401, detail="Token expirado. Inicia sesión."
            )
        except jwt.JWTError as e:
            logger.error(f"❌ [AUTH_SERVICE] Error de firma JWT: {str(e)}")
            raise HTTPException(status_code=401, detail="Firma inválida.")

    @staticmethod
    def verify_google_token(token: str):
        """Verifica criptográficamente el JWT contra los servidores de Google"""
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=500,
                detail="Falta configurar GOOGLE_CLIENT_ID en el servidor",
            )
        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), GOOGLE_CLIENT_ID
            )
            return idinfo
        except ValueError:
            raise HTTPException(
                status_code=401, detail="Token de Google inválido o expirado"
            )

    @staticmethod
    def authenticate_google_user(
        code: str, redirect_uri: str, session: Session, redis_client
    ):
        logger = logging.getLogger("auth_service")
        logger.info("🔍 [AUTH_GOOGLE] Iniciando canje de Code por Token...")

        # 1. Canjear el Code por el Token en los servidores de Google
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        response = requests.post(token_url, data=data)
        if not response.ok:
            logger.error(f"❌ [AUTH_GOOGLE] Error de canje: {response.text}")
            raise HTTPException(
                status_code=400, detail="El código de Google expiró o es inválido"
            )

        tokens = response.json()
        id_token_jwt = tokens.get("id_token")

        # 2. Verificar la firma del JWT que nos dio Google
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_jwt, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            raise HTTPException(
                status_code=401, detail="Token de Google con firma inválida"
            )

        email = idinfo.get("email")
        name = idinfo.get("name", "").replace(" ", "").lower()

        logger.info(f"✅ [AUTH_GOOGLE] Identidad confirmada: {email}")

        # 3. Flujo de decisión: ¿Existe o es nuevo?
        user = session.exec(select(User).where(User.email == email)).first()

        if user:
            # ESCENARIO A: Ya existe
            access_token = create_access_token(
                data={"sub": user.username, "role": user.role}
            )
            refresh_data = create_refresh_token(data={"sub": user.username})

            redis_key = f"session:{user.username}:{refresh_data['family_id']}"
            redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])

            return {
                "status": "success",
                "access_token": access_token,
                "refresh_token": refresh_data["token"],
                "username": user.username,
            }
        else:
            # ESCENARIO B: Es nuevo
            return {
                "status": "needs_invite",
                "email": email,
                "suggested_username": name,
                "provider_token": id_token_jwt,
            }

    @staticmethod
    def register_google_user(join_data, session: Session, redis_client):
        """El usuario nuevo nos ha dado su código de invitación. Lo registramos."""
        # 1. Volvemos a validar el token de Google por seguridad extrema
        idinfo = AuthService.verify_google_token(join_data.token)
        email = idinfo.get("email")
        provider_id = idinfo.get("sub")

        # 2. Verificamos que el Alias que eligió no esté cogido
        user_exists = session.exec(
            select(User).where(User.username == join_data.username)
        ).first()
        if user_exists:
            raise HTTPException(
                status_code=400,
                detail="El nombre de usuario ya está en uso. Elige otro.",
            )

        # 3. Validar código de invitación (El Muro Físico)
        statement = (
            select(InviteCode)
            .where(InviteCode.code == join_data.invite_code)
            .where(InviteCode.is_used == False)
        )
        invite = session.exec(statement).first()

        if not invite:
            raise HTTPException(
                status_code=400,
                detail="Código de invitación inválido o ya fue utilizado",
            )

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
        access_token = create_access_token(
            data={"sub": new_user.username, "role": new_user.role}
        )
        refresh_data = create_refresh_token(data={"sub": new_user.username})

        redis_key = f"session:{new_user.username}:{refresh_data['family_id']}"
        redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])

        return access_token, refresh_data["token"], new_user.username

    @staticmethod
    def authenticate_discord_user(
        code: str, redirect_uri: str, session: Session, redis_client
    ):
        """Intercambia el código por el token de Discord y extrae el perfil."""

        # 1. Intercambiar código por Access Token en Discord
        data = {
            "client_id": settings.DISCORD_CLIENT_ID,
            "client_secret": settings.DISCORD_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            token_response = requests.post(
                "https://discord.com/api/oauth2/token", data=data, headers=headers
            )
            token_response.raise_for_status()
            token_json = token_response.json()
            discord_access_token = token_json["access_token"]
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=401,
                detail="El código de Discord ha expirado o es inválido.",
            )

        # 2. Obtener el perfil del usuario usando el Token
        try:
            user_response = requests.get(
                "https://discord.com/api/users/me",
                headers={"Authorization": f"Bearer {discord_access_token}"},
            )
            user_response.raise_for_status()
            discord_user = user_response.json()
        except requests.exceptions.RequestException:
            raise HTTPException(
                status_code=401, detail="No se pudo obtener el perfil de Discord."
            )

        email = discord_user.get("email")
        provider_id = str(discord_user.get("id"))
        name = discord_user.get("global_name") or discord_user.get("username")

        if not email:
            raise HTTPException(
                status_code=400,
                detail="Necesitas tener un email verificado en Discord.",
            )

        # 3. Flujo de decisión: ¿Existe o es nuevo?
        user = session.exec(select(User).where(User.email == email)).first()

        if user:
            # ESCENARIO A: Ya existe. Iniciamos sesión.
            access_token = create_access_token(
                data={"sub": user.username, "role": user.role}
            )
            refresh_data = create_refresh_token(data={"sub": user.username})

            redis_key = f"session:{user.username}:{refresh_data['family_id']}"
            redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])

            return {
                "status": "success",
                "access_token": access_token,
                "refresh_token": refresh_data["token"],
                "username": user.username,
            }
        else:
            # ESCENARIO B: Es nuevo. Necesita invitación.
            suggested_username = "".join(e for e in name.lower() if e.isalnum())
            return {
                "status": "needs_invite",
                "email": email,
                "suggested_username": suggested_username,
                "provider_id": provider_id,  # Discord ID para enlazar la cuenta
            }
