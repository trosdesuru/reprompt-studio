import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

# Cargar variables del .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("🚨 CRÍTICO: No se encontró DATABASE_URL en el archivo .env")

# pool_pre_ping=True es vital para bases de datos Serverless en la nube
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)


def get_session():
    with Session(engine) as session:
        yield session
