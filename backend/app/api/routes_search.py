from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select

from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import ImagePrompt
from app.services.embedding_service import EmbeddingService

from app.core.errors import AUTH_RESPONSE, SERVER_ERROR_RESPONSE

router = APIRouter()

DbSession = Annotated[Session, Depends(get_session)]
ActiveUser = Annotated[User, Depends(get_current_user)]


@router.get(
    "/vector",
    responses={
        **AUTH_RESPONSE,
        **SERVER_ERROR_RESPONSE,
        500: {
            "description": "No se pudo procesar la búsqueda"
        },
    },
)
def buscar_en_studio(
    current_user: ActiveUser,
    session: DbSession,
    q: Annotated[str, Query(description="Texto a buscar semánticamente")] = "",
    limit: int = 20,
):

    q = q.strip()
    if not q:
        return {"status": "success", "query": q, "results": []}

    query_vector = EmbeddingService.generate_vector(q)

    if not query_vector:
        raise HTTPException(
            status_code=500, detail="No se pudo procesar la búsqueda semántica."
        )

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
