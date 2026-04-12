from fastapi.testclient import TestClient
from app.models.user import User


def test_login_success(client: TestClient, normal_user: User):
    """Prueba que un usuario real puede obtener sus cookies JWT"""
    response = client.post(
        "/api/auth/login",
        json={  # 🟢 FIX: 'json=' en lugar de 'data='
            "username": "test_voyager",
            "password": "PassSegura123!",
        },
    )

    assert response.status_code == 200
    assert "message" in response.json()

    # 🛡️ Validamos que FastAPI nos haya "plantado" la cookie HTTPOnly
    cookies = response.cookies
    assert "access_token" in cookies


def test_login_wrong_password(client: TestClient, normal_user: User):
    """Prueba que los intrusos rebotan en la puerta"""
    response = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "ClaveIncorrecta!"},  # 🟢 FIX
    )

    # Debe devolver 401 Unauthorized
    assert response.status_code == 401
    assert "Usuario o contraseña incorrectos" in response.json().get("detail", "")


def test_rbac_admin_protection(client: TestClient, normal_user: User):
    """Prueba de Escalada de Privilegios: Un usuario normal intenta acceder al Dashboard Admin"""

    # 1. Logueamos al usuario normal para conseguir su cookie
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},  # 🟢 FIX
    )

    # 2. Inyectamos la cookie en el cliente para la siguiente petición
    client.cookies = login_res.cookies

    # 3. Intentamos golpear el endpoint exclusivo de admin
    response = client.get("/api/admin/database-stats")

    # 🛡️ EXPECTATIVA: FastAPI debe reconocer que es un 'voyager', no un 'admin', y lanzarle un 403 Forbidden.
    assert response.status_code == 403
    assert "privilegios" in response.json().get("detail", "").lower()
