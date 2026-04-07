import os
import logging
import secrets
from contextlib import asynccontextmanager
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware

from app.init_db import init_db

from app.api.routes_download import router as download_router
from app.api.routes_search import router as search_router
from app.api.routes_auth import router as auth_router
from app.api.routes_prompt import router as prompt_router
from app.api.routes_public import router as public_router
from app.api.routes_collections import router as collections_router
from app.api.routes_admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("backend")

security = HTTPBasic()


def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(
        credentials.username.encode("utf8"),
        os.getenv("DOCS_USERNAME", "admin").encode("utf8"),
    )
    correct_password = secrets.compare_digest(
        credentials.password.encode("utf8"),
        os.getenv("DOCS_PASSWORD", "admin").encode("utf8"),
    )
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acceso denegado a la documentación",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 API Backend iniciada. Sistemas en línea.")
    try:
        init_db()
    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")

        raise RuntimeError("Imposible iniciar el servidor sin Base de Datos.") from e

    yield
    logger.info("🛑 Apagando API Backend limpiamente...")


app = FastAPI(
    title="reprompt FastAPI",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://reprompt.studio",
    "https://www.reprompt.studio",
]

if os.getenv("ENVIRONMENT") != "production":
    ALLOWED_ORIGINS.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/docs", include_in_schema=False)
async def get_swagger_documentation(username: str = Depends(get_current_username)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="reprompt FastAPI")


@app.get("/openapi.json", include_in_schema=False)
async def openapi(username: str = Depends(get_current_username)):
    return app.openapi()


app.include_router(search_router, prefix="/api")
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(public_router, prefix="/api/public", tags=["Feed"])
app.include_router(prompt_router, prefix="/api/prompts", tags=["Reprompt Studio"])
app.include_router(download_router, prefix="/api/download", tags=["Descargas"])
app.include_router(collections_router, prefix="/api/collections", tags=["Colecciones"])
