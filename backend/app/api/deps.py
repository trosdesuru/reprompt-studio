# backend/app/api/deps.py
import os
from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.user import User

SECRET_KEY = os.getenv("SECRET_KEY", "super_clave_secreta_de_respaldo")
ALGORITHM = "HS256"

def get_current_user(request: Request, session: Session = Depends(get_session)):
    """Verifica el JWT leyéndolo directamente desde la Cookie HttpOnly."""
    
    # Extraemos el token de la galleta enviada por el navegador
    token = request.cookies.get("access_token")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
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