# backend/app/api/routes_public.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_
from app.core.db import get_session
from app.models.user import User
from app.models.collection import Collection
from app.models.prompt import ImagePrompt

router = APIRouter()


@router.get("/profile/{username}")
def get_public_profile(username: str, session: Session = Depends(get_session)):
    """Devuelve los datos públicos de un usuario, sus colecciones y sus prompts recientes."""
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 1. Colecciones Públicas
    collections = session.exec(
        select(Collection)
        .where(Collection.user_id == user.id)
        .where(Collection.is_private == False)
    ).all()

    # 2. Prompts Públicos (Que no estén en una colección o que su colección sea pública)
    statement = (
        select(ImagePrompt)
        .outerjoin(Collection, ImagePrompt.collection_id == Collection.id)
        .where(ImagePrompt.user_id == user.id)
        .where(or_(ImagePrompt.collection_id == None, Collection.is_private == False))
        .order_by(ImagePrompt.created_at.desc())
        .limit(50)  # Traemos los últimos 50 para el escaparate
    )
    prompts = session.exec(statement).all()

    return {
        "status": "success",
        "user": {"username": user.username, "role": user.role, "tier": user.tier},
        "collections": collections,
        "recent_prompts": prompts,
    }


@router.get("/profile/{username}/{collection_slug}")
def get_public_collection(
    username: str, collection_slug: str, session: Session = Depends(get_session)
):
    """Devuelve una colección específica siempre y cuando sea pública."""
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    collection = session.exec(
        select(Collection)
        .where(Collection.user_id == user.id)
        .where(Collection.slug == collection_slug)
        .where(Collection.is_private == False)
    ).first()

    if not collection:
        raise HTTPException(
            status_code=404, detail="Colección no encontrada o es privada"
        )

    prompts = session.exec(
        select(ImagePrompt)
        .where(ImagePrompt.collection_id == collection.id)
        .order_by(ImagePrompt.created_at.desc())
    ).all()

    return {
        "status": "success",
        "user": {"username": user.username},
        "collection": collection,
        "prompts": prompts,
    }
