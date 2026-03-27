# backend/app/core/security.py
import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

# Cargamos el .env
load_dotenv()

# Configuraciones del Token
SECRET_KEY = os.getenv("SECRET_KEY", "super_clave_secreta_de_respaldo")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # El token durará 1 semana entera

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def create_access_token(data: dict) -> str:
    """Fabrica el Pase VIP (JWT) con los datos del usuario y una fecha de caducidad"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Firmamos el token con nuestra llave maestra
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt