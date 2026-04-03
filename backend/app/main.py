import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_download import router as download_router
from app.api.routes_search import router as search_router
from app.api.routes_auth import router as auth_router
from app.api.routes_prompt import router as prompt_router
from app.api.routes_public import router as public_router
from app.api.routes_collections import router as collections_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 API Backend iniciada. Sistemas en línea.")

    try:
        init_db()
    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")

    yield
    logger.info("🛑 Apagando API Backend limpiamente...")


app = FastAPI(title="reprompt FastAPI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router, prefix="/api")
app.include_router(download_router, prefix="/api/download", tags=["Descargas"])
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(prompt_router, prefix="/api/prompts", tags=["Reprompt Studio"])
app.include_router(public_router, prefix="/api/public", tags=["Escaparate Público"])
app.include_router(collections_router, prefix="/api/collections", tags=["Colecciones"])
