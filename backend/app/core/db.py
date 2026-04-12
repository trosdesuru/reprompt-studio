import os
import logging
from sqlmodel import create_engine, Session
from sqlmodel.pool import StaticPool
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv("DATABASE_URL", "")

if not raw_url:
    raise ValueError(
        "🚨 CRÍTICO: No se encontró DATABASE_URL en las variables de entorno."
    )

# 🟢 FIX: Limpieza extrema de comillas y espacios accidentales
clean_url = raw_url.strip().strip("'").strip('"')

if "sqlite" in clean_url.lower():
    # ==========================================
    # 🧪 MODO TESTING (GitHub Actions / Local RAM)
    # ==========================================
    print("🔗 [DEBUG DB] Conectando a SQLite (Memoria efímera para tests)")
    engine = create_engine(
        clean_url,
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # ==========================================
    # 🌍 MODO PRODUCCIÓN (PostgreSQL / Neon)
    # ==========================================
    clean_url = clean_url.replace("postgres://", "postgresql://", 1)
    clean_url = clean_url.replace("&channel_binding=require", "").replace(
        "?channel_binding=require", ""
    )

    if "sslmode=require" not in clean_url:
        separator = "&" if "?" in clean_url else "?"
        clean_url += f"{separator}sslmode=require"

    safe_log_url = clean_url.split("@")[-1] if "@" in clean_url else "URL_OCULTA"
    print(f"🔗 [DEBUG DB] Conectando a PostgreSQL: {safe_log_url}")

    engine = create_engine(
        clean_url,
        echo=False,
        pool_size=5,
        max_overflow=10,
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
