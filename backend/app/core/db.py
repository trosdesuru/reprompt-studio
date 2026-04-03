import os
import logging
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv("DATABASE_URL")

if not raw_url:
    raise ValueError("🚨 CRÍTICO: No se encontró DATABASE_URL en las variables de entorno.")

# ==============================================================================
# 🛡️ SANITIZADOR DE URLS (EL FIX DEFINITIVO PARA NEON.TECH)
# ==============================================================================

# 1. Aseguramos que empiece por postgresql://
clean_url = raw_url.replace("postgres://", "postgresql://", 1) if raw_url.startswith("postgres://") else raw_url

# 2. 🟢 EXTIRPACIÓN DEL POOLER (El núcleo del problema)
# Reemplazamos "-pooler." por "." para conectar directo al servidor físico.
# Esto permite que create_all() funcione sin que PgBouncer nos eche.
clean_url = clean_url.replace("-pooler.", ".")

# 3. 🟢 INYECCIÓN DEL CERTIFICADO SSL (Sin romper parámetros existentes)
if "sslmode=" not in clean_url:
    separator = "&" if "?" in clean_url else "?"
    clean_url += f"{separator}sslmode=require"

# Imprimimos la URL sanitizada (ocultando la contraseña) para estar 100% seguros
safe_log_url = clean_url.split("@")[-1] if "@" in clean_url else "URL_OCULTA"
print(f"🔗 [DEBUG DB] Conectando a: {safe_log_url}")

# ==============================================================================
# 🚀 CONFIGURACIÓN DEL ENGINE
# ==============================================================================
engine = create_engine(
    clean_url,
    echo=False,
    pool_pre_ping=True,    # Mantiene la conexión viva proactivamente
    pool_recycle=300,      # Renueva la conexión cada 5 minutos
    pool_size=5,
    max_overflow=10
)

def get_session():
    with Session(engine) as session:
        yield session