from fastapi.testclient import TestClient

def test_api_is_alive(client: TestClient):
    """Comprueba que el backend responde y el escudo de seguridad está activo"""
    
    response = client.get("/api/auth/me")
    
    assert response.status_code == 401