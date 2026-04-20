from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.db import get_session
import time

router = APIRouter()


@router.get("/health")
def health_check(session: Session = Depends(get_session)):
    """
    Diagnóstico profundo: Verifica latencia de DB y estado de conexión.
    """
    start_db = time.time()
    try:
        session.exec(select(1)).first()
        db_status = "online"
        db_latency = f"{round((time.time() - start_db) * 1000, 2)}ms"
    except Exception:
        db_status = "offline"
        db_latency = "n/a"

    return {
        "status": "operational",
        "timestamp": time.time(),
        "checks": {
            "database": db_status,
            "db_latency": db_latency,
            "version": "0.5.0-beta",
        },
    }
