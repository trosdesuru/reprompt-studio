import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("🚨 CRÍTICO: No se encontró DATABASE_URL en el archivo .env")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # 🟢 MAGIA 1: Ping proactivo
    pool_recycle=300,  # 🟢 MAGIA 2: Renueva conexiones cada 5 min
    pool_size=5,
    max_overflow=10,
)


def get_session():
    with Session(engine) as session:
        yield session
