from jose import jwt
from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.user import User
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
)


class AuthService:
    @staticmethod
    def authenticate_user(user_data, session: Session, redis_client):
        """Valida credenciales y genera la familia de tokens mutantes."""
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

        # Guardamos en Redis
        redis_key = f"session:{user.username}:{refresh_data['family_id']}"
        redis_client.setex(redis_key, 60 * 60 * 24 * 7, refresh_data["jti"])

        return access_token, refresh_data["token"], user.username

    @staticmethod
    def rotate_tokens(refresh_token: str, session: Session, redis_client):
        """Ejecuta la RTR (Refresh Token Rotation) y detecta brechas de seguridad."""
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

            # 🚨 DETECCIÓN DE BRECHA
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

            # Mutar tokens
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
