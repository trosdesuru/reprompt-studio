import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from app.models.user import User
from app.core.security import get_password_hash
from app.core.redis_config import conn as redis_client

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.api.deps import get_session

sqlite_url = "sqlite:///:memory:"
engine = create_engine(
    sqlite_url, connect_args={"check_same_thread": False}, poolclass=StaticPool
)


@pytest.fixture(name="session")
def session_fixture():
    """Crea las tablas en la RAM, entrega la sesión al test, y luego lo destruye todo."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Secuestra la app de FastAPI y reemplaza la DB real de Neon por la fantasma de RAM."""

    def get_session_override():
        with Session(engine) as req_session:
            yield req_session

    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


@pytest.fixture(name="normal_user")
def normal_user_fixture(session: Session):
    """Inyecta un usuario estándar (voyager) en la RAM"""
    user = User(
        username="test_voyager",
        email="voyager@test.com",
        hashed_password=get_password_hash("PassSegura123!"),
        role="voyager",
        is_active=True,
    )
    session.add(user)
    session.commit()
    return user


@pytest.fixture(name="admin_user")
def admin_user_fixture(session: Session):
    """Inyecta un administrador supremo en la RAM"""
    admin = User(
        username="test_admin",
        email="admin@test.com",
        hashed_password=get_password_hash("AdminSeguro123!"),
        role="admin",
        is_active=True,
    )
    session.add(admin)
    session.commit()
    return admin


@pytest.fixture(autouse=True)
def reset_redis_state():
    """
    🧹 LIMPIEZA DE ESTADO:
    Se ejecuta automáticamente (autouse=True) antes de CADA test.
    Garantiza que ningún test herede los bloqueos de fuerza bruta de los tests anteriores.
    """
    brute_force_keys = redis_client.keys("brute_force_user:*")
    rate_limit_keys = redis_client.keys("rate_limit:*")

    keys_to_delete = brute_force_keys + rate_limit_keys

    if keys_to_delete:
        redis_client.delete(*keys_to_delete)
