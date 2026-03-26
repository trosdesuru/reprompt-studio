import sys
import os

print("--- DIAGNÓSTICO DE ENTORNO ---")
print(f"Directorio actual: {os.getcwd()}")
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH')}")
print(f"Contenido de /app: {os.listdir('/app')}")
try:
    import rq
    print(f"Versión de RQ instalada: {rq.__version__}")
    print(f"Ubicación de RQ: {rq.__file__}")
except ImportError:
    print("❌ ERROR: RQ no está instalado en este entorno")

try:
    from app.core.redis_config import conn
    print("✅ Conexión a Redis configurada correctamente")
except Exception as e:
    print(f"❌ ERROR al importar redis_config: {e}")