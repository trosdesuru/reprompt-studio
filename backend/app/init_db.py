import time
import secrets
import logging
import socket
import psycopg2
from urllib.parse import urlparse
from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel, Session, select

from app.core.db import engine, clean_url
from app.models.user import InviteCode, User, AuditLog
from app.models.gallery import GalleryMetric
from app.models.prompt import ImagePrompt
from app.models.collection import Collection

logger = logging.getLogger("init_db")


def run_network_diagnostics():
    logger.info("============== 🕵️ INICIANDO DIAGNÓSTICO DE RED ==============")
    parsed = urlparse(clean_url)
    host = parsed.hostname
    port = parsed.port or 5432

    # 1. Prueba de DNS
    logger.info(f"📡 [PROBE 1/3] Resolviendo DNS para: {host}")
    try:
        ip = socket.gethostbyname(host)
        logger.info(f"✅ [PROBE 1/3] IP Resuelta: {ip}")
    except Exception as e:
        logger.error(f"❌ [PROBE 1/3] Fallo de resolución DNS: {e}")
        return False

    # 2. Prueba de Socket TCP (Ver si el puerto 5432 está abierto y accesible)
    logger.info(f"🚪 [PROBE 2/3] Probando puerto TCP {ip}:{port}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5.0)  # 5 segundos de timeout
        sock.connect((ip, port))
        logger.info("✅ [PROBE 2/3] Puerto TCP abierto y accesible.")
        sock.close()
    except Exception as e:
        logger.error(f"❌ [PROBE 2/3] El puerto está bloqueado o inaccesible: {e}")
        return False

    # 3. Prueba de Autenticación Cruda y SSL (psycopg2 directo, sin SQLAlchemy)
    logger.info("🔐 [PROBE 3/3] Probando Handshake SSL y Autenticación directa...")
    try:
        start_time = time.time()
        # Usamos un timeout corto de 10s para no esperar los famosos 19.5s
        conn = psycopg2.connect(clean_url, connect_timeout=10)
        elapsed = round(time.time() - start_time, 2)
        logger.info(f"✅ [PROBE 3/3] ¡Autenticación SSL exitosa en {elapsed}s!")

        # Test de lectura básica
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        logger.info(f"🐘 [PROBE] Versión de DB: {version[0][:30]}...")
        cur.close()
        conn.close()
        logger.info("============== 🕵️ DIAGNÓSTICO COMPLETADO ==============\n")
        return True
    except Exception as e:
        elapsed = round(time.time() - start_time, 2)
        logger.error(f"❌ [PROBE 3/3] Falló la negociación SSL/Auth tras {elapsed}s.")
        logger.error(f"Detalle exacto: {e}")
        logger.info("============== 🕵️ DIAGNÓSTICO COMPLETADO ==============\n")
        return False


def init_db():
    logger.info("🔌 [DB] Verificando infraestructura antes de iniciar...")

    # 🟢 EJECUTAMOS EL DIAGNÓSTICO ANTES DE NADA
    run_network_diagnostics()

    max_retries = 3
    retry_delay = 5

    logger.info(
        "🔌 [DB] Iniciando secuencia de sincronización de tablas (SQLAlchemy)..."
    )
    connection_successful = False

    for attempt in range(max_retries):
        try:
            logger.info(
                f"⏳ [DB] [Intento {attempt + 1}/{max_retries}] Sincronizando metadata..."
            )
            SQLModel.metadata.create_all(engine)
            logger.info("✅ [DB] ¡Metadata sincronizada correctamente!")
            connection_successful = True
            break
        except Exception as e:
            logger.warning(f"⚠️ [DB] Falló el intento {attempt + 1}. Detalle: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                logger.error("❌ [DB] Imposible sincronizar tablas.")
                raise e

    if connection_successful:
        with Session(engine) as session:
            existing_code = session.exec(select(InviteCode)).first()
            if not existing_code:
                master_code = f"TROYA-{secrets.token_hex(4).upper()}"
                new_invite = InviteCode(code=master_code)
                session.add(new_invite)
                session.commit()
                logger.info("✨ Base de Datos inicializada por primera vez.")
                logger.warning(f"🔑 TU CÓDIGO MAESTRO ES: {master_code}")
            else:
                logger.info("✅ Base de datos lista para operar.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
