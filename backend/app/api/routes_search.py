# backend/app/api/routes_search.py
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List

from app.core.db import get_session
from app.api.deps import get_current_user

from app.models.user import User
from app.models.prompt import ImagePrompt
from app.services.embedding_service import EmbeddingService

router = APIRouter()


@router.get("/vector")
def buscar_en_studio(
    q: str = Query(..., description="Texto a buscar semánticamente"),
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    🔍 Buscador Semántico Local (Studio):
    1. Convierte la query en un vector.
    2. Busca en la DB los prompts que más se acerquen a ese significado.
    """
    if not q:
        return {"status": "success", "query": q, "results": []}

    query_vector = EmbeddingService.generate_vector(q)

    if not query_vector:
        return {"status": "error", "message": "No se pudo procesar la búsqueda"}

    statement = (
        select(ImagePrompt)
        .where(ImagePrompt.user_id == current_user.id)
        .order_by(ImagePrompt.embedding.cosine_distance(query_vector))
        .limit(limit)
    )

    resultados = session.exec(statement).all()

    for r in resultados:
        r.embedding = []

    return {"status": "success", "query": q, "results": resultados}
