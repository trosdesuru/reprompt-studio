import jwt
from unittest.mock import patch
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
    # El hacker crea un payload perfecto haciéndose pasar por administrador
    forged_payload = {"sub": normal_user.username, "role": "admin", "type": "access"}
    # Lo firma con una clave inventada
    forged_token = jwt.encode(
        forged_payload, "clave_secreta_falsa_del_hacker", algorithm="HS256"
    )

    # Inyectamos la cookie envenenada
    client.cookies.set("access_token", forged_token)

    # Intentamos entrar al sanctum sanctorum
    response = client.get("/api/admin/database-stats")

    # 🛡️ EXPECTATIVA: El servidor detecta que la firma (Hash) no coincide con su SECRET_KEY.
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

    # 🥷 MOCKING DE DESASTRE:
    # 1. validate_magic_bytes funciona (el archivo es válido).
    # 2. move_to_permanent FALLA (Cloudflare escupe un error 500 interno).
    with patch("app.api.routes_prompt.validate_magic_bytes", return_value=True), patch(
        "app.api.routes_prompt.move_to_permanent", return_value=False
    ):

        response = client.post("/api/prompts/save", json=payload)

    # 🛡️ EXPECTATIVA 1: La API debe abortar con 500 de forma controlada.
    assert response.status_code == 500
    assert "Error interno al consolidar" in response.json().get("detail", "")

    # 🛡️ EXPECTATIVA 2 (LA MÁS IMPORTANTE): Revisamos la base de datos SQL.
    # No debe existir ningún registro con el título "Prompt Huérfano".
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
    en el campo 'prompt' para intentar colapsar el parseador JSON o llenar la DB.
    """
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    # Generamos un string ridículamente largo
    massive_string = "A" * 1_000_000  # 1 millón de caracteres

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "Ataque RAM",
        "prompt": massive_string,
        "image_url": f"{base_url}/temp/{normal_user.id}/valido.png",
    }

    response = client.post("/api/prompts/save", json=payload)

    # 🛡️ EXPECTATIVA: Pydantic intercepta el payload ANTES de que llegue a tu lógica
    # de Python gracias al `max_length=20000` de tu esquema PromptCreate.
    # Devuelve 422 Unprocessable Entity, salvando la RAM de tu servidor.
    assert response.status_code == 422
    error_msg = response.json()["detail"][0]["msg"]
    assert "String should have at most 20000 characters" in error_msg
