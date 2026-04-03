import time
import secrets
import logging
from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel, Session, select

from app.core.db import engine
from app.models.user import InviteCode, User, AuditLog
from app.models.gallery import GalleryMetric
from app.models.prompt import ImagePrompt
from app.models.collection import Collection

logger = logging.getLogger("init_db")


def init_db():
    max_retries = 5
    retry_delay = 5

    logger.info("🔌 [DB] Iniciando secuencia de conexión a la Base de Datos...")

    connection_successful = False

    for attempt in range(max_retries):
        try:
            logger.info(
                f"⏳ [DB] [Intento {attempt + 1}/{max_retries}] Contactando con el servidor de Neon.tech..."
            )

            # Intentamos crear/sincronizar las tablas
            SQLModel.metadata.create_all(engine)

            logger.info(
                "✅ [DB] ¡Conexión establecida con éxito y tablas sincronizadas!"
            )
            connection_successful = True
            break  # Salimos del bucle mágico porque hemos tenido éxito

        except OperationalError as e:
            # Capturamos específicamente el error de desconexión / timeout
            logger.warning(
                f"⚠️ [DB] Falló el intento {attempt + 1}. Servidor inalcanzable (posible Cold Start)."
            )

            if attempt < max_retries - 1:
                logger.info(
                    f"💤 [DB] Esperando {retry_delay} segundos para que Neon.tech despierte..."
                )
                time.sleep(retry_delay)
            else:
                logger.error(
                    "❌ [DB] ERROR CRÍTICO: Imposible conectar tras múltiples intentos."
                )
                logger.error(f"Detalle técnico: {str(e)}")
                raise e
        except Exception as e:
            # Cualquier otro error (ej. credenciales inválidas) explota directamente
            logger.error(f"❌ [DB] Error inesperado sincronizando tablas: {e}")
            raise e

    if connection_successful:
        with Session(engine) as session:
            existing_code = session.exec(select(InviteCode)).first()

            if not existing_code:
                # Base de datos virgen, creamos el código maestro
                master_code = f"TROYA-{secrets.token_hex(4).upper()}"
                new_invite = InviteCode(code=master_code)

                session.add(new_invite)
                session.commit()

                logger.info("✨ Base de Datos inicializada por primera vez.")
                logger.warning("=" * 40)
                logger.warning(f"🔑 TU CÓDIGO MAESTRO ES: {master_code}")
                logger.warning("⚠️ Cópialo ahora. Úsalo para crear tu cuenta Admin.")
                logger.warning("=" * 40)
            else:
                logger.info("✅ Las tablas ya existían y la base de datos está lista.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
