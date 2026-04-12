from unittest.mock import patch
from fastapi.testclient import TestClient
from app.models.user import User


def test_admin_get_database_stats(client: TestClient, admin_user: User):
    """Prueba que el admin puede acceder al motor central del Dashboard"""
    # 1. Login con el usuario ADMIN que creamos en conftest.py
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_admin", "password": "AdminSeguro123!"},
    )
    client.cookies = login_res.cookies

    # 2. Golpear la ruta pesada
    response = client.get("/api/admin/database-stats")

    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "users" in data


def test_admin_get_storage_stats(client: TestClient, admin_user: User):
    """Prueba las métricas de R2 interceptando (mockeando) a Cloudflare"""
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_admin", "password": "AdminSeguro123!"},
    )
    client.cookies = login_res.cookies

    # 🥷 MOCKING: Inventamos una respuesta falsa de Amazon S3/Cloudflare R2
    mock_r2_response = {
        "Contents": [{"Size": 1048576}, {"Size": 2097152}]  # 1 MB  # 2 MB
    }

    # Secuestramos el cliente s3 para que devuelva nuestros datos falsos y no llame a la nube
    with patch(
        "app.api.routes_admin.s3_client.list_objects_v2", return_value=mock_r2_response
    ):
        response = client.get("/api/admin/storage-stats")

    assert response.status_code == 200
    data = response.json()
    assert data["total_files"] == 2
    assert data["total_mb"] == 3.0


def test_voyager_rejected_from_admin_garbage_collector(
    client: TestClient, normal_user: User
):
    """🛡️ Prueba Defensiva: Un usuario normal intenta disparar el recolector de basura"""
    # 1. Login con usuario NORMAL (Voyager)
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    # 2. Intenta lanzar un comando destructivo
    response = client.post("/api/admin/garbage-collect")

    # 🛡️ EXPECTATIVA: El RBAC (Role-Based Access Control) debe bloquearlo con un 403.
    assert response.status_code == 403
    assert "privilegios" in response.json().get("detail", "").lower()
