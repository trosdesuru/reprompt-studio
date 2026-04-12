import sys
import os
from sqlmodel import Session, select

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import engine
from app.models.user import User
from app.core.security import get_password_hash


def seed_e2e_user():
    with Session(engine) as session:
        existing = session.exec(
            select(User).where(User.username == "admin_e2e")
        ).first()
        if existing:
            session.delete(existing)
            session.commit()

        test_user = User(
            username="admin_e2e",
            email="e2e@test.local",
            hashed_password=get_password_hash("E2E_Secure_Pass_123!"),
            role="admin",
            is_active=True,
        )
        session.add(test_user)
        session.commit()
        print("✅ [SEED] Usuario E2E 'admin_e2e' inyectado en Neon DB.")


if __name__ == "__main__":
    seed_e2e_user()
