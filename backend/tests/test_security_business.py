from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.directory import Directory
from app.models.prompt import ImagePrompt
from app.core.config import settings


# =====================================================================
# 1. ATAQUES DE FUERZA BRUTA (RATE LIMITING)
# =====================================================================
def test_brute_force_login_rate_limiter(client: TestClient):
    for _ in range(5):
        res = client.post(
            "/api/auth/login", json={"username": "hacker_bot", "password": "123"}
        )
        assert res.status_code == 401

    res_bloqueado = client.post(
        "/api/auth/login", json={"username": "hacker_bot", "password": "123"}
    )
    assert res_bloqueado.status_code == 429
    assert "límite de seguridad" in res_bloqueado.json().get("detail", "").lower()


# =====================================================================
# 2. EVASIÓN DE FIRMAS MÁGICAS (ARCHIVOS MALICIOSOS)
# =====================================================================
def test_malicious_file_upload_magic_bytes(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "Gatito",
        "prompt": "Un gatito",
        "image_url": f"{base_url}/temp/{normal_user.id}/virus.png",
    }

    # 🟢 MOCK GLOBAL S3
    mock_s3_client = MagicMock()
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=b"fake_virus_bytes"))
    }
    mock_s3_client.head_object.return_value = {"ContentLength": 1024}

    with patch("app.services.prompt_service.s3_client", mock_s3_client), patch(
        "app.services.prompt_service.validate_magic_bytes", return_value=False
    ), patch("app.services.prompt_service.delete_file") as mock_delete:

        response = client.post("/api/prompts/save", json=payload)

        assert response.status_code == 400
        assert "corrupto o es malicioso" in response.json().get("detail", "").lower()
        mock_delete.assert_called_once()


# =====================================================================
# 3. AUTORIZACIÓN ROTA (BOLA / IDOR)
# =====================================================================
def test_bola_private_directory_theft(
    client: TestClient, session: Session, admin_user: User, normal_user: User
):
    private_col = Directory(
        user_id=admin_user.id,
        name="Secretos de Estado",
        slug="secretos",
        is_private=True,
    )
    session.add(private_col)
    session.commit()

    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies
    response = client.post(f"/api/download/directory/{private_col.id}")

    assert response.status_code == 403


# =====================================================================
# 4. EXPLOTACIÓN LÍMITES DE NEGOCIO (QUOTA BYPASS)
# =====================================================================
def test_voyager_plan_limit_exploitation(
    client: TestClient, session: Session, normal_user: User
):
    public_col = Directory(
        user_id=normal_user.id, name="Masiva", slug="masiva", is_private=False
    )
    session.add(public_col)
    session.commit()

    fake_prompts = [
        ImagePrompt(
            user_id=normal_user.id,
            directory_id=public_col.id,
            title=f"Im {i}",
            prompt="t",
        )
        for i in range(51)
    ]
    session.add_all(fake_prompts)
    session.commit()

    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies
    response = client.post(f"/api/download/directory/{public_col.id}")

    assert response.status_code == 403
