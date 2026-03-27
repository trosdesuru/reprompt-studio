# backend/app/core/security.py
import bcrypt

def get_password_hash(password: str) -> str:
    """Recibe una contraseña en texto plano y devuelve el hash"""
    # bcrypt requiere que las contraseñas estén en formato de bytes
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    
    # Lo devolvemos como string para guardarlo cómodamente en la base de datos
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña ingresada coincide con el hash de la BD"""
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(pwd_bytes, hash_bytes)