# backend/reset_db.py
from sqlmodel import SQLModel
from app.core.db import engine
from app.models.user import User, InviteCode, AuditLog
from app.models.collection import Collection
from app.models.prompt import ImagePrompt
from app.models.gallery import GalleryMetric


def reset_database():
    print("🚨 [1/3] Conectando a Neon y borrando tablas antiguas...")
    SQLModel.metadata.drop_all(engine)

    print("✨ [2/3] Creando tablas con el nuevo esquema...")
    SQLModel.metadata.create_all(engine)

    print("✅ [3/3] ¡Base de datos limpia y lista para la nueva arquitectura!")


if __name__ == "__main__":
    reset_database()
