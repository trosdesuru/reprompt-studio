# backend/app/core/db.py
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

# Cargamos las variables del archivo .env
load_dotenv()

# Obtenemos la URL de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("🚨 ERROR CRÍTICO: No se encontró DATABASE_URL en el entorno.")

# Configuramos el motor de SQLModel. 
# Importante: Para Neon.tech u otras DB en la nube, es buena práctica habilitar el pool_pre_ping
engine = create_engine(
    DATABASE_URL, 
    echo=False, # Ponlo a True si quieres ver el código SQL que se genera en la consola
    pool_pre_ping=True
)

def get_session():
    """Generador de sesiones para inyectar en las rutas de FastAPI"""
    with Session(engine) as session:
        yield session