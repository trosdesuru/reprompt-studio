# backend/reset_db.py
from sqlmodel import SQLModel, Session, text
from app.core.db import engine
# Asegúrate de importar todos los modelos para que SQLModel los conozca
from app.models.user import User, InviteCode, AuditLog
from app.models.directory import Directory 
from app.models.prompt import ImagePrompt
from app.models.gallery import GalleryMetric

def reset_database():
    print("🚨 [1/4] Borrando y recreando el esquema 'public'...")
    with Session(engine) as session:
        session.exec(text("DROP SCHEMA public CASCADE;"))
        session.exec(text("CREATE SCHEMA public;"))
        session.commit()

    print("🧩 [2/4] Activando extensión pgvector...")
    with Session(engine) as session:
        session.exec(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        session.commit()

    print("✨ [3/4] Creando tablas con la nueva arquitectura jerárquica...")
    SQLModel.metadata.create_all(engine)

    print("✅ [4/4] ¡Base de Datos Neon alineada y lista!")

if __name__ == "__main__":
    reset_database()