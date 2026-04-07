import os
import logging
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv("DATABASE_URL")

if not raw_url:
    raise ValueError(
        "🚨 CRÍTICO: No se encontró DATABASE_URL en las variables de entorno."
    )

clean_url = (
    raw_url.replace("postgres://", "postgresql://", 1)
    if raw_url.startswith("postgres://")
    else raw_url
)

clean_url = clean_url.replace("&channel_binding=require", "").replace(
    "?channel_binding=require", ""
)

if "sslmode=require" not in clean_url:
    separator = "&" if "?" in clean_url else "?"
    clean_url += f"{separator}sslmode=require"

safe_log_url = clean_url.split("@")[-1] if "@" in clean_url else "URL_OCULTA"
print(f"🔗 [DEBUG DB] Conectando a Neon (Directo al hierro): {safe_log_url}")

engine = create_engine(
    clean_url,
    echo=False,
    pool_size=5,          # 🟢 Máximo de conexiones abiertas (Ajustar según tu plan de Neon)
    max_overflow=10,       # 🟢 Conexiones extra si hay un pico de tráfico repentino
    pool_pre_ping=True,   # 🟢 CRÍTICO para Neon: Comprueba si la conexión sigue viva antes de usarla (porque Neon se "duerme").
    pool_recycle=300,     # Recicla las conexiones cada 5 minutos.
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    },
)


def get_session():
    with Session(engine) as session:
        yield session
