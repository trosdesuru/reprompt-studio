import secrets
from sqlmodel import SQLModel, Session
from app.core.db import engine
from app.models.user import InviteCode, User

def init_db():
    print("⏳ Conectando a Neon.tech y sincronizando tablas...")
    # Crea las tablas en la base de datos basándose en las clases de SQLModel
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        existing_code = session.query(InviteCode).first()
        if not existing_code:
            # Generar código VIP estilo "TROYA-A1B2C3D4"
            master_code = f"TROYA-{secrets.token_hex(4).upper()}"
            new_invite = InviteCode(code=master_code)
            session.add(new_invite)
            session.commit()
            print("✅ ¡Base de Datos inicializada con éxito!")
            print(f"🔑 TU CÓDIGO MAESTRO ES: {master_code}")
            print("⚠️ Cópialo y guárdalo. Lo usarás para crear tu cuenta Admin.")
        else:
            print("✅ Las tablas ya existían y la base de datos está lista.")

if __name__ == "__main__":
    init_db()