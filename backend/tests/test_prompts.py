from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.models.user import User
from app.core.config import settings


def test_save_prompt_success(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    fake_url = f"{base_url}/temp/{normal_user.id}/cyberpunk_cat.png"

    payload = {
        "title": "Cyberpunk Cat",
        "prompt": "A cat with neon glasses in tokyo",
        "image_url": fake_url,
        "software": "Midjourney",
    }

    # 🟢 MOCK GLOBAL S3
    mock_s3_client = MagicMock()
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=b"fake_bytes"))
    }
    mock_s3_client.head_object.return_value = {"ContentLength": 1024}

    with patch("app.services.prompt_service.s3_client", mock_s3_client), patch(
        "app.services.prompt_service.validate_magic_bytes", return_value=True
    ), patch("app.services.prompt_service.move_to_permanent", return_value=True), patch(
        "app.services.embedding_service.EmbeddingService.generate_vector",
        return_value=[0.0] * 384,
    ):

        response = client.post("/api/prompts/save", json=payload)

    assert response.status_code == 200
    data = response.json().get("data", {})
    assert data["title"] == "Cyberpunk Cat"


def test_save_prompt_security_block(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    malicious_url = f"{base_url}/temp/OTRO_USUARIO_ID_FALSO/test_image.png"
    payload = {
        "title": "Hack Attempt",
        "prompt": "Hacking the mainframe",
        "image_url": malicious_url,
    }

    # 🟢 MOCK GLOBAL S3 CON DATOS PARA EVITAR TYPE-ERROR
    mock_s3_client = MagicMock()
    mock_s3_client.head_object.return_value = {"ContentLength": 1024}

    with patch("app.services.prompt_service.s3_client", mock_s3_client):
        response = client.post("/api/prompts/save", json=payload)

    assert response.status_code == 403


def test_get_my_prompts(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies
    response = client.get("/api/prompts/studio")
    assert response.status_code == 200
    assert "data" in response.json()


def test_xss_injection_blocked_by_pydantic(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "<script>alert('Robando cookies')</script>",
        "prompt": "Un perrito feliz",
        "image_url": f"{base_url}/temp/{normal_user.id}/safe.png",
    }

    response = client.post("/api/prompts/save", json=payload)
    assert response.status_code == 422
    assert "seguridad" in response.text.lower()
