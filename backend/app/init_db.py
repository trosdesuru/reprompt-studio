import secrets
import logging
from sqlmodel import SQLModel, Session, select
from app.core.db import engine
from app.models.user import InviteCode, User, AuditLog
from app.models.gallery import GalleryMetric
from app.models.prompt import SavedPrompt

# Configuración del logger para que sea visible en Docker
logger = logging.getLogger("init_db")

def init_db():
    logger.info("⏳ Conectando a Neon.tech y sincronizando tablas...")
    try:
        # Esto crea las tablas que NO existan. No borra datos existentes.
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Sincronización de tablas completada.")
    except Exception as e:
        logger.error(f"❌ Error crítico sincronizando tablas: {e}")
        raise e

    with Session(engine) as session:
        # Usamos la sintaxis recomendada de SQLModel para la consulta
        existing_code = session.exec(select(InviteCode)).first()
        
        if not existing_code:
            # Generar código VIP estilo "TROYA-A1B2C3D4"
            master_code = f"TROYA-{secrets.token_hex(4).upper()}"
            new_invite = InviteCode(code=master_code)
            
            session.add(new_invite)
            session.commit()
            
            # Usamos logger para asegurar visibilidad en los logs de Docker
            logger.info("✨ Base de Datos inicializada por primera vez.")
            logger.warning("="*40)
            logger.warning(f"🔑 TU CÓDIGO MAESTRO ES: {master_code}")
            logger.warning("⚠️ Cópialo ahora. Úsalo para crear tu cuenta Admin.")
            logger.warning("="*40)
        else:
            logger.info("✅ Las tablas ya existían y la base de datos está lista.")

if __name__ == "__main__":
    # Configuración básica por si se ejecuta el archivo directamente
    logging.basicConfig(level=logging.INFO)
    init_db()