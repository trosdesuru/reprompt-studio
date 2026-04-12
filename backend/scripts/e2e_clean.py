import sys
import os
from sqlmodel import Session, select

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import engine
from app.models.user import User


def clean_e2e_user():
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == "admin_e2e")).first()
        if user:
            session.delete(user)
            session.commit()
            print("🧹 [CLEAN] Usuario E2E 'admin_e2e' eliminado de Neon DB.")


if __name__ == "__main__":
    clean_e2e_user()
