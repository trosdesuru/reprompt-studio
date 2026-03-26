import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.core.redis_config import conn

# 1. Configuración de Logs Global
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("backend")

app = FastAPI(title="Bot de Descarga API")

# 2. Configuración de CORS (Soluciona el error de "Blocked by CORS")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Tu URL de Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 API Backend iniciada. Conexión Redis: OK")

app.include_router(router)