import jwt
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.user import User
from app.models.prompt import ImagePrompt
from app.core.config import settings


# =====================================================================
# 🧨 ATAQUE 1: FALSIFICACIÓN DE FIRMA JWT (TAMPERING)
# =====================================================================
def test_hacker_forges_admin_jwt(client: TestClient, normal_user: User):
    """
    Test Agresivo: El hacker se fabrica su propio token de admin usando
    un secreto falso, intentando engañar a la cerradura criptográfica.
    """
    forged_payload = {"sub": normal_user.username, "role": "admin", "type": "access"}
    forged_token = jwt.encode(
        forged_payload, "clave_secreta_falsa_del_hacker", algorithm="HS256"
    )
    client.cookies.set("access_token", forged_token)
    response = client.get("/api/admin/database-stats")

    assert response.status_code == 401
    assert "No autenticado" in response.json().get("detail", "")


# =====================================================================
# 🧨 ATAQUE 2: CAÍDA CRÍTICA DE INFRAESTRUCTURA (R2 OUTAGE)
# =====================================================================
def test_cloudflare_r2_outage_during_save(
    client: TestClient, session: Session, normal_user: User
):
    """
    Test Agresivo: Simulamos que Cloudflare R2 colapsa durante el guardado.
    La base de datos NO debe guardar registros huérfanos.
    """
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "Prompt Huérfano",
        "prompt": "Un prompt que nunca verá la luz",
        "image_url": f"{base_url}/temp/{normal_user.id}/valido.png",
    }

    # 🟢 EL ESCUDO GLOBAL DE S3
    mock_s3_client = MagicMock()
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=b"fake_bytes"))
    }
    mock_s3_client.head_object.return_value = {"ContentLength": 1024}

    with patch("app.services.prompt_service.s3_client", mock_s3_client), patch(
        "app.services.prompt_service.validate_magic_bytes",
        return_value={"ContentLength": 1024},
    ), patch("app.services.prompt_service.move_to_permanent", return_value=False):

        response = client.post("/api/prompts/save", json=payload)
        assert response.status_code == 500

    fantasma = session.exec(
        select(ImagePrompt).where(ImagePrompt.title == "Prompt Huérfano")
    ).first()
    assert (
        fantasma is None
    ), "🚨 ¡PELIGRO! La base de datos ha guardado un registro huérfano"


# =====================================================================
# 🧨 ATAQUE 3: SATURACIÓN DE MEMORIA RAM (LAYER 7 PAYLOAD)
# =====================================================================
def test_layer_7_memory_exhaustion_attack(client: TestClient, normal_user: User):
    """
    Test Agresivo: El atacante envía un string gigante (1 Megabyte de letra 'A')
    """
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    massive_string = "A" * 1_000_000
    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "Ataque RAM",
        "prompt": massive_string,
        "image_url": f"{base_url}/temp/{normal_user.id}/valido.png",
    }

    response = client.post("/api/prompts/save", json=payload)
    assert response.status_code == 422
    error_msg = response.json()["detail"][0]["msg"]
    assert "String should have at most 20000 characters" in error_msg
