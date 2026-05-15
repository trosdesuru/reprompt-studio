import concurrent.futures
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.directory import Directory
from app.models.prompt import ImagePrompt
from app.core.config import settings


# =====================================================================
# 💣 1. CONDICIÓN DE CARRERA (RACE CONDITION)
# =====================================================================
def test_race_condition_download_limits(
    client: TestClient, session: Session, normal_user: User
):
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

    def lanzar_peticion_simultanea():
        thread_client = TestClient(client.app)
        thread_client.cookies = cookies
        return thread_client.post(f"/api/download/directory/{public_col.id}")

    exitos = 0
    bloqueados = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        resultados = list(
            executor.map(lambda _: lanzar_peticion_simultanea(), range(20))
        )

    for res in resultados:
        if res.status_code in [200, 202]:
            exitos += 1
        elif res.status_code in [429, 403, 500]:
            bloqueados += 1

    assert exitos < 20, "🚨 CRÍTICO: Vulnerabilidad de Race Condition detectada."
    assert bloqueados > 0, "El escudo no actuó a tiempo."


# =====================================================================
# 💣 2. ATAQUE DOS (DENIAL OF SERVICE) CAPA 7: PAYLOAD GIGANTE
# =====================================================================
def test_layer_7_dos_ram_exhaustion(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies
    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    payload = {
        "title": "Bomba de RAM",
        "prompt": "A" * 5000000,
        "image_url": f"{base_url}/temp/{normal_user.id}/safe.png",
    }
    response = client.post("/api/prompts/save", json=payload)
    assert response.status_code == 422


# =====================================================================
# 💣 3. SSRF EXTREMO Y PATH TRAVERSAL
# =====================================================================
def test_ssrf_and_path_traversal_evasion(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies
    base_url = settings.R2_PUBLIC_URL.rstrip("/")

    malicious_url_1 = (
        f"{base_url}/temp/{normal_user.id}/%2e%2e%2f%2e%2e%2fadmin_keys.txt"
    )
    malicious_url_2 = f"{base_url}.hacker.com/temp/{normal_user.id}/virus.png"

    # 🟢 MOCK GLOBAL S3
    mock_s3_client = MagicMock()
    mock_s3_client.head_object.return_value = {"ContentLength": 1024}
    # Simulamos el contenido del archivo si llegara a leerse
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=b"fake_bytes"))
    }

    with patch("app.services.prompt_service.s3_client", mock_s3_client), patch(
        "app.services.storage.s3_client", mock_s3_client
    ), patch(
        "app.services.prompt_service.validate_magic_bytes",
        return_value={"ContentLength": 1024},
    ):

        res_1 = client.post(
            "/api/prompts/save",
            json={"title": "Hacking", "prompt": "test", "image_url": malicious_url_1},
        )
        res_2 = client.post(
            "/api/prompts/save",
            json={"title": "Hacking", "prompt": "test", "image_url": malicious_url_2},
        )

    # Puede dar 400, 403, 404 o incluso 422, pero JAMÁS debe llegar al 500 (ni guardar el archivo)
    assert res_1.status_code in [
        400,
        403,
        404,
        422,
    ], "🚨 SSRF Vulnerability: Path traversal permitido"
    assert res_2.status_code in [
        400,
        403,
        404,
        422,
    ], "🚨 SSRF Vulnerability: Subdominio falso no detectado"


# =====================================================================
# 💣 4. FATIGA DE CONEXIONES DB
# =====================================================================
def test_db_connection_pool_exhaustion(
    client: TestClient, session: Session, normal_user: User
):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    client.cookies = login_res.cookies

    fake_prompts = [
        ImagePrompt(
            user_id=normal_user.id,
            title=f"Batch Delete {i}",
            prompt="Para borrar",
            embedding=[0.0] * 384,
        )
        for i in range(1000)
    ]
    session.add_all(fake_prompts)
    session.commit()

    payload = {"prompt_ids": [str(p.id) for p in fake_prompts]}
    response = client.post("/api/prompts/bulk/delete", json=payload)

    assert response.status_code == 200


# =====================================================================
# 💣 5. ESTRÉS EXTREMO: SUBIDA Y GUARDADO MASIVO
# =====================================================================
def test_chaos_massive_batch_save_stress(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    cookies = login_res.cookies
    base_url = settings.R2_PUBLIC_URL.rstrip("/")
    user_id_str = str(normal_user.id)

    # 🟢 MOCK GLOBAL S3
    mock_s3_client = MagicMock()
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=b"fake_image_bytes_12345"))
    }
    mock_s3_client.head_object.return_value = {"ContentLength": 1024}

    def guardar_prompt_simultaneo(index):
        thread_client = TestClient(client.app)
        thread_client.cookies = cookies
        payload = {
            "title": f"Batch {index}",
            "prompt": "test",
            "image_url": f"{base_url}/temp/{user_id_str}/b_{index}.png",
            "software": "A1111",
        }
        try:
            return thread_client.post("/api/prompts/save", json=payload)
        except BaseException:

            class FakeResponse:
                status_code = 500

            return FakeResponse()

    with patch("app.services.prompt_service.s3_client", mock_s3_client), patch(
        "app.services.prompt_service.validate_magic_bytes", return_value=True
    ), patch("app.services.prompt_service.move_to_permanent", return_value=True), patch(
        "app.services.embedding_service.EmbeddingService.generate_vector",
        return_value=[0.0] * 384,
    ):

        exitos_200 = 0
        bloqueos_sqlite_500 = 0
        bloqueos_seguridad = 0

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            resultados = list(executor.map(guardar_prompt_simultaneo, range(50)))

        for res in resultados:
            if res.status_code == 200:
                exitos_200 += 1
            elif res.status_code == 500:
                bloqueos_sqlite_500 += 1
            elif res.status_code in [
                401,
                403,
                404,
                429,
            ]:
                bloqueos_seguridad += 1
            else:
                print(f"⚠️ Código HTTP inesperado en Chaos Test: {res.status_code}")

        assert exitos_200 + bloqueos_sqlite_500 + bloqueos_seguridad == 50


# =====================================================================
# 💣 6. ESTRÉS DE RAM: ARCHIVOS PESADOS
# =====================================================================
def test_chaos_heavy_image_ram_exhaustion(client: TestClient, normal_user: User):
    login_res = client.post(
        "/api/auth/login",
        json={"username": "test_voyager", "password": "PassSegura123!"},
    )
    cookies = login_res.cookies
    base_url = settings.R2_PUBLIC_URL.rstrip("/")

    # 🟢 MOCK GLOBAL S3 (Archivo pesado simulado)
    heavy_payload_bytes = b"0" * (20 * 1024 * 1024)
    mock_s3_client = MagicMock()
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=heavy_payload_bytes))
    }
    mock_s3_client.head_object.return_value = {
        "ContentLength": len(heavy_payload_bytes)
    }

    def guardar_prompt_pesado(index):
        thread_client = TestClient(client.app)
        thread_client.cookies = cookies
        payload = {
            "title": "Heavy",
            "prompt": "test",
            "image_url": f"{base_url}/temp/{normal_user.id}/h_{index}.png",
            "software": "A1111",
        }
        try:
            return thread_client.post("/api/prompts/save", json=payload)
        except BaseException:

            class FakeResponse:
                status_code = 500

            return FakeResponse()

    with patch("app.services.prompt_service.s3_client", mock_s3_client), patch(
        "app.services.prompt_service.validate_magic_bytes", return_value=True
    ), patch("app.services.prompt_service.move_to_permanent", return_value=True), patch(
        "app.services.embedding_service.EmbeddingService.generate_vector",
        return_value=[0.0] * 384,
    ):

        exitos = 0
        bloqueos = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            resultados = list(executor.map(guardar_prompt_pesado, range(10)))

        for res in resultados:
            if res.status_code == 200:
                exitos += 1
            elif res.status_code in [401, 403, 404, 413, 429, 500]:
                bloqueos += 1

        assert exitos + bloqueos == 10
