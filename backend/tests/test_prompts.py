from unittest.mock import patch
from fastapi.testclient import TestClient
from app.models.user import User
from app.core.config import settings


def test_save_prompt_success(client: TestClient, normal_user: User):
    """Testea el guardado de un prompt simulando que R2 funciona perfectamente"""

    # 1. Autenticar al usuario para conseguir su pase VIP
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    # 2. Fabricar una URL que engañe a la seguridad estricta de la ruta
    # Tu backend exige que la imagen venga estrictamente de la carpeta /temp/{USER_ID}/
    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    fake_url = f"{base_url}/temp/{normal_user.id}/cyberpunk_cat.png"

    payload = {
        "title": "Cyberpunk Cat",
        "prompt": "A cat with neon glasses in tokyo",
        "image_url": fake_url,
        "software": "Midjourney",
    }

    # 3. 🥷 MOCKING (El Escudo del Arquitecto)
    # Secuestramos las funciones que tocan internet para que devuelvan True automáticamente
    with patch("app.api.routes_prompt.validate_magic_bytes", return_value=True), patch(
        "app.api.routes_prompt.move_to_permanent", return_value=True
    ):

        response = client.post("/api/prompts/save", json=payload)

    # 🛡️ EXPECTATIVA: El prompt se guarda en la base de datos RAM correctamente
    assert response.status_code == 200
    data = response.json().get("data", {})
    assert data["title"] == "Cyberpunk Cat"
    # FastAPI debe haber reemplazado "temp/" por "prompts/" en la URL final
    assert "prompts/" in data["image_url"]


def test_get_my_prompts(client: TestClient, normal_user: User):
    """Testea que el feed personal del usuario funciona"""
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    response = client.get("/api/prompts/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_save_prompt_security_block(client: TestClient, normal_user: User):
    """🛡️ Test Defensivo: Intento de Path Traversal (Robo de imagen ajena)"""
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    # 🚨 URL maliciosa: Intentamos reclamar como nuestra una imagen que está en la carpeta de OTRO usuario
    malicious_url = f"{base_url}/temp/OTRO_USUARIO_ID_FALSO/test_image.png"

    payload = {
        "title": "Hack Attempt",
        "prompt": "Hacking the mainframe",
        "image_url": malicious_url,
    }

    response = client.post("/api/prompts/save", json=payload)

    # 🛡️ EXPECTATIVA: Tu backend debe detectar que el ID de la URL no coincide con el del usuario logueado.
    assert response.status_code == 403
    assert "No se puede guardar archivo" in response.json().get("detail", "")
