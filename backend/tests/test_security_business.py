from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.collection import Collection
from app.models.prompt import ImagePrompt
from app.core.config import settings


# =====================================================================
# 🛡️ 1. ATAQUES DE FUERZA BRUTA (RATE LIMITING)
# =====================================================================
def test_brute_force_login_rate_limiter(client: TestClient):
    """Test Defensivo: El escudo de Redis corta la cabeza al sexto intento."""
    for _ in range(5):
        res = client.post(
            "/api/auth/login", json={"username": "hacker_bot", "password": "123"}
        )
        assert res.status_code == 401

    res_bloqueado = client.post(
        "/api/auth/login", json={"username": "hacker_bot", "password": "123"}
    )

    assert res_bloqueado.status_code == 429
    # 🟢 FIX 1: Esperamos el mensaje de la dependencia de RateLimiter global
    assert "límite de seguridad" in res_bloqueado.json().get("detail", "").lower()


# =====================================================================
# 🛡️ 2. EVASIÓN DE FIRMAS MÁGICAS (ARCHIVOS MALICIOSOS)
# =====================================================================
def test_malicious_file_upload_magic_bytes(client: TestClient, normal_user: User):
    """Test Defensivo: Bloqueo de ejecutables disfrazados de imágenes"""
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    # 🟢 FIX 2: Usamos el R2_PUBLIC_URL dinámico para pasar el primer filtro de seguridad
    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "Gatito bonito",
        "prompt": "Un gatito cyberpunk",
        "image_url": f"{base_url}/temp/{normal_user.id}/virus.png",
    }

    with patch("app.api.routes_prompt.validate_magic_bytes", return_value=False), patch(
        "app.api.routes_prompt.delete_file"
    ) as mock_delete:

        response = client.post("/api/prompts/save", json=payload)

        assert response.status_code == 400
        assert "corrupto o es malicioso" in response.json().get("detail", "")
        mock_delete.assert_called_once()


# =====================================================================
# 🛡️ 3. AUTORIZACIÓN ROTA (BOLA / IDOR)
# =====================================================================
def test_bola_private_collection_theft(
    client: TestClient, session: Session, admin_user: User, normal_user: User
):
    """Test Defensivo: 'Voyager' intenta descargar la colección oculta del 'Admin'"""
    private_col = Collection(
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

    response = client.post(f"/api/download/collection/{private_col.id}")

    assert response.status_code == 403
    assert "privada" in response.json().get("detail", "").lower()


# =====================================================================
# 🛡️ 4. EXPLOTACIÓN LÍMITES DE NEGOCIO (QUOTA BYPASS)
# =====================================================================
def test_voyager_plan_limit_exploitation(
    client: TestClient, session: Session, normal_user: User
):
    """
    Test Defensivo: El plan Voyager permite descargar máx 50 imágenes.
    Verificamos que el sistema protege el modelo de negocio.
    """
    public_col = Collection(
        user_id=normal_user.id, name="Masiva", slug="masiva", is_private=False
    )
    session.add(public_col)
    session.commit()

    # 🟢 FIX 3: Pragmatismo Radical. En lugar de Mockear y romper la sesión,
    # insertamos 51 imágenes en la memoria RAM (Tarda 0.005 segundos).
    fake_prompts = [
        ImagePrompt(
            user_id=normal_user.id,
            collection_id=public_col.id,
            title=f"Imagen {i}",
            prompt="test",
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

    # Intentamos descargar la colección
    response = client.post(f"/api/download/collection/{public_col.id}")

    assert response.status_code == 403
    assert "máximo de 50 imágenes" in response.json().get("detail", "").lower()
