import concurrent.futures
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.directory import Directory
from app.models.prompt import ImagePrompt
from app.core.config import settings


# =====================================================================
# 💣 1. CONDICIÓN DE CARRERA (RACE CONDITION) EN WORKERS DE DESCARGA
# =====================================================================
def test_race_condition_download_limits(
    client: TestClient, session: Session, normal_user: User
):
    """
    Test del Caos: El usuario 'Voyager' tiene un límite de descargas.
    ¿Qué pasa si manda 20 peticiones EXACTAMENTE en el mismo milisegundo?
    Si no hay bloqueos (locks) en la base de datos o en Redis, el worker podría
    procesar las 20 y regalarle descargas infinitas.
    """
    # 1. Setup: Crear directorio
    public_col = Directory(
        user_id=normal_user.id, name="Coleccion Golosa", slug="golosa"
    )
    session.add(public_col)
    session.commit()

    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    cookies = login_res.cookies

    # 2. Función de ataque simultáneo
    def lanzar_peticion_simultanea():
        # Usamos un cliente por hilo para evitar colisiones de la librería requests
        thread_client = TestClient(client.app)
        thread_client.cookies = cookies
        return thread_client.post(f"/api/download/directory/{public_col.id}")

    # 3. Lanzamos 20 hilos al mismo tiempo como un cañón
    exitos = 0
    bloqueados = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        resultados = list(
            executor.map(lambda _: lanzar_peticion_simultanea(), range(20))
        )

    for res in resultados:
        if (
            res.status_code == 200 or res.status_code == 202
        ):  # 202 Accepted (Worker iniciado)
            exitos += 1
        for res in resultados:
            if res.status_code in [200, 202]: 
                exitos += 1
            elif res.status_code in [429, 403, 500]: 
                bloqueados += 1

    # 🛡️ EXPECTATIVA DE HIERRO:
    # Incluso disparando 20 veces a la vez, el Rate Limiter o la DB deben bloquear la mayoría.
    # No debería haber 20 éxitos.
    assert (
        exitos < 20
    ), "🚨 CRÍTICO: Vulnerabilidad de Race Condition detectada. ¡Rate Limit burlado!"
    assert bloqueados > 0, "El escudo no actuó a tiempo ante peticiones concurrentes."


# =====================================================================
# 💣 2. ATAQUE DOS (DENIAL OF SERVICE) CAPA 7: PAYLOAD GIGANTE
# =====================================================================
def test_layer_7_dos_ram_exhaustion(client: TestClient, normal_user: User):
    """
    Test del Caos: Un atacante intenta colapsar la RAM del worker de Uvicorn
    enviando un prompt de 5 Megabytes en un solo JSON.
    """
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    fake_url = f"{base_url}/temp/{normal_user.id}/safe.png"

    # Generamos un string de 5 millones de caracteres (aprox 5MB de RAM al parsear)
    payload_masivo = "A" * 5000000

    payload = {
        "title": "Bomba de RAM",
        "prompt": payload_masivo,
        "image_url": fake_url,
    }

    # Lanzamos el obús
    response = client.post("/api/prompts/save", json=payload)

    # 🛡️ EXPECTATIVA DE HIERRO:
    # Pydantic debe rechazar esto en microsegundos ANTES de que intente llegar
    # a PostgreSQL o al motor de IA (que colapsaría).
    assert (
        response.status_code == 422
    ), "🚨 CRÍTICO: Pydantic dejó pasar un payload destructivo"
    assert "max_length" in response.text.lower() or "too long" in response.text.lower()


# =====================================================================
# 💣 3. SSRF EXTREMO Y PATH TRAVERSAL (EVASIÓN DE CUARENTENA)
# =====================================================================
def test_ssrf_and_path_traversal_evasion(client: TestClient, normal_user: User):
    """
    Test del Caos: Intentamos engañar a la lógica de validación de S3
    inyectando caracteres de retroceso (../) y URLs codificadas para obligar
    al servidor a leer archivos de configuración interna o de otros buckets.
    """
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    base_url = settings.R2_PUBLIC_URL.rstrip("/")

    # Intento 1: Path Traversal codificado (URL Encoding)
    # Intenta salir de /temp/ y acceder a la raíz del bucket de S3
    malicious_url_1 = (
        f"{base_url}/temp/{normal_user.id}/%2e%2e%2f%2e%2e%2fadmin_keys.txt"
    )

    # Intento 2: Disfraz de subdominio (engañar al startswith)
    # https://r2.reprompt.studio.atacante.com/temp/...
    malicious_url_2 = f"{base_url}.hacker.com/temp/{normal_user.id}/virus.png"

    with patch("app.services.prompt_service.validate_magic_bytes", return_value=True):

        res_1 = client.post(
            "/api/prompts/save",
            json={"title": "Hacking", "prompt": "test", "image_url": malicious_url_1},
        )
        res_2 = client.post(
            "/api/prompts/save",
            json={"title": "Hacking", "prompt": "test", "image_url": malicious_url_2},
        )

        # 🛡️ EXPECTATIVAS DE HIERRO:
        # El backend debe detectar la anomalía y devolver 400 o 403.
        # (Dependiendo de lo estricto que sea tu código en prompt_service).
        assert res_1.status_code in [
            400,
            403,
            404,
        ], "🚨 SSRF Vulnerability: Path traversal permitido"
        assert res_2.status_code in [
            400,
            403,
        ], "🚨 SSRF Vulnerability: Subdominio falso no detectado"


# =====================================================================
# 💣 4. FATIGA DE CONEXIONES DB (DB POOL EXHAUSTION)
# =====================================================================
def test_db_connection_pool_exhaustion(client: TestClient, session: Session, normal_user: User):
    """
    Test del Caos: Insertamos 1000 prompts reales y mandamos borrarlos de golpe.
    Verificamos que el sistema soporta la carga masiva sin colapsar.
    """
    login_res = client.post("/api/auth/login", json={"username": "test_voyager", "password": "PassSegura123!"})
    client.cookies = login_res.cookies

    # 1. Creamos 1000 prompts reales en la base de datos de test
    fake_prompts = [
        ImagePrompt(
            user_id=normal_user.id,
            title=f"Batch Delete {i}",
            prompt="Para borrar",
            embedding=[0.0] * 384 # Evitamos el quejido de pgvector
        )
        for i in range(1000)
    ]
    session.add_all(fake_prompts)
    session.commit()

    # 2. Obtenemos sus IDs reales
    real_ids = [str(p.id) for p in fake_prompts]

    # 3. Lanzamos el misil: Borrar 1000 registros en una sola llamada
    payload = {
        "prompt_ids": real_ids
    }

    response = client.post("/api/prompts/batch-delete", json=payload)

    # 🛡️ EXPECTATIVA DE HIERRO:
    assert response.status_code == 200
    assert "correctamente" in response.json().get("message", "").lower()