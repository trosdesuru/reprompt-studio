import logging
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from app.api.deps import get_optional_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger("backend")


class BugReport(BaseModel):
    User: str
    message: str
    stack: str | None = None
    digest: str | None = None
    url: str
    timestamp: str


@router.post("/bugs")
async def receive_bug_report(report: BugReport, request: Request):
    """
    Recibe la telemetría del Error Boundary del Frontend.
    """
    client_ip = request.client.host if request.client else "IP Desconocida"

    logger.critical("=" * 60)
    logger.critical(f"🚨 NUEVO BUG REPORTADO A Trosdesuru 🚨")
    logger.critical(f"📍 Origen: {report.url} (IP: {client_ip})")
    logger.critical(f"🕰️ Timestamp: {report.timestamp}")
    logger.critical(f"💬 Mensaje: {report.message}")

    if report.stack:
        logger.critical(f"📚 Stacktrace: \n{report.stack[:600]}...")
    logger.critical("=" * 60)

    # NOTA FUTURA: Aquí podrías añadir un código simple usando 'httpx' o 'requests'
    # para enviar este reporte como un mensaje push a un bot de Telegram, a un canal de Discord,
    # o insertarlo en una nueva tabla 'AuditBugs' en Neon.tech.

    return {
        "status": "success",
        "message": "Reporte interceptado con éxito en la base.",
    }
