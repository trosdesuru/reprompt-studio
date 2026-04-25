import os
import logging
import secrets
import uuid
import time

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.init_db import init_db

from app.api.routes_auth import router as auth_router
from app.api.routes_oauth import router as oauth_router
from app.api.routes_users import router as users_router
from app.api.routes_admin import router as admin_router
from app.api.routes_public import router as public_router
from app.api.routes_prompt import router as prompt_router
from app.api.routes_download import router as download_router
from app.api.routes_search import router as search_router
from app.api.routes_directories import router as directories_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("backend")

security = HTTPBasic()


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        request.state.correlation_id = correlation_id

        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        response.headers["X-Request-ID"] = correlation_id
        response.headers["X-Process-Time"] = str(process_time)
        return response


def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    """Protección básica para la documentación de la API"""
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
    """Ciclo de vida: Inicializa la base de datos al arrancar"""
    logger.info("🚀 API Backend iniciada. Sistemas en línea.")
    try:
        init_db()
    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")
        raise RuntimeError("Imposible iniciar el servidor sin Base de Datos.") from e
    yield
    logger.info("🛑 Apagando API Backend limpiamente...")


app = FastAPI(
    title="Reprompt Studio API",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.add_middleware(CorrelationIdMiddleware)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://reprompt.studio",
    "https://www.reprompt.studio",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🩺 HEALTH CHECK
@app.api_route("/api/health", methods=["GET", "HEAD"], include_in_schema=False)
async def health_check():
    return {"status": "ok"}


# 📚 DOCUMENTACIÓN PROTEGIDA
@app.get("/docs", include_in_schema=False)
async def get_swagger_documentation(username: str = Depends(get_current_username)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="Reprompt API Docs")


@app.get("/openapi.json", include_in_schema=False)
async def openapi(username: str = Depends(get_current_username)):
    return app.openapi()


app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(oauth_router, prefix="/api/auth", tags=["OAuth"])
app.include_router(users_router, prefix="/api/auth", tags=["User Profile"])
app.include_router(admin_router, prefix="/api/auth/admin", tags=["Administration"])
app.include_router(directories_router, prefix="/api/directories", tags=["Directorios"])
app.include_router(prompt_router, prefix="/api/prompts", tags=["Studio Prompts"])
app.include_router(search_router, prefix="/api/search", tags=["Búsqueda Inteligente"])
app.include_router(public_router, prefix="/api/public", tags=["Feed Público"])
app.include_router(download_router, prefix="/api/download", tags=["Descargas"])
app.include_router(admin_router, prefix="/api/admin", tags=["Administración"])
