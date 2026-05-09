import random
from locust import HttpUser, task, between

class RepromptUser(HttpUser):
    # Simula el tiempo que un humano real tarda en leer la pantalla antes de hacer otro clic (entre 1 y 5 segundos)
    wait_time = between(1, 5)

    def on_start(self):
        """Se ejecuta una sola vez cuando el usuario virtual 'entra' a la web."""
        # Usamos tu usuario semilla de E2E
        response = self.client.post("/api/auth/login", json={
            "username": "admin_e2e",
            "password": "E2E_Secure_Pass_123!"
        })
        
        if response.status_code != 200:
            print(f"⚠️ Fallo de Login en Locust (¿Rate Limit?): {response.status_code}")
        # Locust guarda automáticamente las cookies (access_token y refresh_token) para las siguientes peticiones.

    @task(4)
    def view_public_feed(self):
        """Tarea muy frecuente (Peso 4): Un usuario navegando por el feed público."""
        self.client.get("/api/public/feed")

    @task(2)
    def view_personal_studio(self):
        """Tarea frecuente (Peso 2): Un usuario mirando sus propias carpetas."""
        self.client.get("/api/prompts/studio")

    @task(1)
    def search_vectorial(self):
        """Tarea pesada (Peso 1): Obliga a la API a usar FastEmbed (RAM) y a Postgres a usar pgvector (CPU DB)."""
        queries = ["cyberpunk cat", "neon city", "anime girl", "mecha robot"]
        self.client.get(f"/api/search/vector?q={random.choice(queries)}")

    @task(1)
    def check_health(self):
        """Tarea de control: Simula el ping del frontend o de Render."""
        self.client.get("/api/system/health")