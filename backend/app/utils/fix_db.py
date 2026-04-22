# fix_db.py
from sqlmodel import Session, select
from app.core.db import engine
from app.models.user import User
from app.utils import normalize_username


def sanitize_existing_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"🔍 Revisando {len(users)} usuarios...")

        for user in users:
            old_name = user.username
            new_name = normalize_username(old_name)

            if old_name != new_name:
                final_name = new_name
                c = 1
                while session.exec(
                    select(User).where(User.username == final_name)
                ).first():
                    final_name = f"{new_name}{c}"
                    c += 1

                print(f"✅ Actualizando: '{old_name}' -> '{final_name}'")
                user.username = final_name
                session.add(user)

        session.commit()
        print("🚀 Base de datos saneada.")


if __name__ == "__main__":
    sanitize_existing_users()
