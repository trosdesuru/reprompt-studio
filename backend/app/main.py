import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_download import router as download_router
from app.api.routes_search import router as search_router

# 🟢 Añade el nuevo router de autenticación
from app.api.routes_auth import router as auth_router

# Configuración de Logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("backend")

app = FastAPI(title="Bot de Descarga API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 API Backend iniciada. Conexión Redis: OK")


# Conectamos las rutas divididas
app.include_router(search_router, prefix="/api")
app.include_router(download_router, prefix="/api")
# 🟢 Conectamos la ruta de autenticación
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
