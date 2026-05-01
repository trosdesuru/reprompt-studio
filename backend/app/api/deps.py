# backend/app/api/deps.py
import os
import redis
import logging
import jwt
import datetime

from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session, select, func
from sqlalchemy import func

from app.core.db import get_session
from app.core.redis_config import conn as redis_client
from app.models.user import User, UserRole
from app.models.prompt import ImagePrompt
from app.core.quotas import PLAN_QUOTAS

from jwt.exceptions import InvalidTokenError, PyJWTError

logger = logging.getLogger("deps")

SECRET_KEY = os.getenv("SECRET_KEY", "super_clave_secreta_de_respaldo")
ALGORITHM = "HS256"

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_limiter = redis.from_url(REDIS_URL, decode_responses=True)


class RateLimiter:
    """Escudo Anti-Fuerza Bruta optimizado. Limita por User ID si está logueado, sino por IP."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def __call__(self, request: Request):
        client_identifier = request.client.host if request.client else "127.0.0.1"

        token = request.cookies.get("access_token")
        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                if payload.get("sub"):
                    client_identifier = f"user:{payload.get('sub')}"
            except InvalidTokenError:
                pass

        redis_key = f"rate_limit:{client_identifier}:{request.url.path}"

        try:
            current_requests = redis_limiter.incr(redis_key)
            if current_requests == 1:
                redis_limiter.expire(redis_key, self.window_seconds)

            if current_requests > self.max_requests:
                # Lanzamos 429 explícito
                raise HTTPException(
                    status_code=429,
                    detail=f"Límite de seguridad excedido. Máximo {self.max_requests} intentos cada {self.window_seconds} segundos.",
                )
        except redis.RedisError:
            # Programación Defensiva: Si Redis se cae, dejamos pasar el tráfico (Fail-open)
            # antes que tirar todo el servidor.
            pass


class GlobalRateLimiter:
    """Escudo Anti-DDoS Global. Corta la corriente si el servidor entero se satura."""

    def __init__(self, max_global_requests: int, window_seconds: int):
        self.max_requests = max_global_requests
        self.window_seconds = window_seconds

    def __call__(self, request: Request):
        global_key = f"global_limit:{request.url.path}"
        try:
            current_requests = redis_limiter.incr(global_key)
            if current_requests == 1:
                redis_limiter.expire(global_key, self.window_seconds)

            if current_requests > self.max_requests:
                raise HTTPException(
                    status_code=503,
                    detail="El servidor está experimentando un pico de tráfico anómalo. Por favor, espera unos segundos.",
                )
        except redis.RedisError:
            pass


def get_current_user(request: Request, session: Session = Depends(get_session)):
    """Verifica el JWT leyéndolo directamente desde la Cookie HttpOnly."""
    token = request.cookies.get("access_token")

    if not token:
        logger.debug(
            f"🛡️ [DEPS] Rechazado: Ruta {request.url.path} sin cookie 'access_token'."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        redis_client.setex(f"user:online:{user.id}", 300, "1")

        if username is None:
            logger.warning("🛡️ [DEPS] Rechazado: Token válido pero sin campo 'sub'.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
            )
    except jwt.ExpiredSignatureError:
        logger.debug(
            f"⏱️ [DEPS] Access Token expirado en ruta {request.url.path}. El frontend debería pedir /refresh."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado"
        )
    except PyJWTError as e:
        logger.warning(f"🛡️ [DEPS] Rechazado: Error decodificando JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
        )
    except Exception as e:
        pass

    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        logger.error(f"🛡️ [DEPS] Rechazado: Usuario {username} en token pero no en DB.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
        )

    return user


def get_current_admin(current_user: User = Depends(get_current_user)):
    """Dependencia de RBAC: Verifica que el usuario logueado sea Administrador."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes suficientes privilegios (Requiere rol Admin)",
        )
    return current_user


def get_optional_user(request: Request, session: Session = Depends(get_session)):
    """Verifica el JWT pero no lanza error si no existe. Útil para identificar al dueño en rutas públicas."""
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username:
            return session.exec(select(User).where(User.username == username)).first()
    except PyJWTError:
        return None
    return None


def verify_prompt_quota(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:

    limits = PLAN_QUOTAS.get(current_user.role, PLAN_QUOTAS[UserRole.VOYAGER])

    if current_user.role == UserRole.ADMIN:
        return current_user

    # Bloqueamos la fila del usuario para evitar condiciones de carrera (concurrencia)
    user_db = session.exec(
        select(User).where(User.id == current_user.id).with_for_update()
    ).first()

    if not user_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 1. Gestión del Reset Mensual
    now = datetime.datetime.now(datetime.timezone.utc)
    # Comprobamos si ha pasado un mes (simplificado: si el mes o el año son diferentes)
    if (now.month != user_db.last_reset_date.month) or (
        now.year != user_db.last_reset_date.year
    ):
        user_db.monthly_uploads = 0
        user_db.last_reset_date = now
        session.add(user_db)
        session.commit()
        session.refresh(user_db)

    # 2. Validación de Almacenamiento Total (Storage)
    storage_mb = user_db.storage_used / (1024 * 1024)
    if storage_mb >= limits["max_storage_mb"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Límite de almacenamiento alcanzado ({limits['max_storage_mb']}MB). Haz upgrade a un plan superior.",
        )

    # 3. Lógica del "Bono de Bienvenida" vs "Recarga Mensual"
    count_statement = select(func.count(ImagePrompt.id)).where(
        ImagePrompt.user_id == current_user.id
    )
    total_lifetime_prompts = session.exec(count_statement).one()

    # Si aún no ha agotado el bono inicial
    if total_lifetime_prompts < limits["max_prompts_lifetime_bonus"]:
        pass  # Permitido por el bono de bienvenida
    # Si ya agotó el bono, evaluamos el límite mensual
    elif user_db.monthly_uploads >= limits["monthly_refill"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Has agotado tu cuota. Tu plan ({current_user.role.capitalize()}) permite {limits['monthly_refill']} subidas este mes. Llevas {user_db.monthly_uploads}.",
        )

    return user_db
