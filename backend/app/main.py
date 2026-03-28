# backend/app/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_download import router as download_router
from app.api.routes_search import router as search_router
from app.api.routes_auth import router as auth_router

# Configuración de Logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("backend")

app = FastAPI(title="Bot de Descarga API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 API Backend iniciada. Conexión Redis: OK")


# Conectamos las rutas
app.include_router(search_router, prefix="/api")
app.include_router(download_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
