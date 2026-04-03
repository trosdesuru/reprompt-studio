# backend/app/api/deps.py
import os
import redis
from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.user import User

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
            except JWTError:
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
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception

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
    except JWTError:
        return None
    return None
