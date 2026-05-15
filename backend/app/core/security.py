# backend/app/core/security.py
import os
import jwt
import uuid
import bcrypt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Cargamos el .env
load_dotenv()

# Configuraciones del Token
SECRET_KEY = os.getenv("SECRET_KEY", "super_clave_secreta_de_respaldo")
ALGORITHM = "HS256"

# 🟢 Las nuevas duraciones de los tokens
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


def create_access_token(data: dict) -> str:
    """Fabrica el Pase VIP (JWT) de 15 minutos"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, family_id: str = None) -> dict:
    """Fabrica el Pase Maestro Mutante de 7 días"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # Generamos el ADN del token
    token_id = str(uuid.uuid4())
    token_family = family_id if family_id else str(uuid.uuid4())

    to_encode.update(
        {
            "exp": expire,
            "type": "refresh",
            "jti": token_id,
            "family": token_family,
        }
    )

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # Devolvemos el JWT y sus IDs para que el router los guarde en Redis
    return {"token": encoded_jwt, "jti": token_id, "family_id": token_family}
