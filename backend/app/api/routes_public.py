# backend/app/api/routes_public.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_
from app.core.db import get_session
from app.models.user import User
from app.models.collection import Collection
from app.models.prompt import ImagePrompt
from app.api.deps import RateLimiter, GlobalRateLimiter, get_optional_user

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
    username: str,
    collection_slug: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_optional_user),
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

    if collection.is_private:
        if not current_user or current_user.id != collection.user_id:
            raise HTTPException(
                status_code=403, detail="Esta colección es privada o no existe."
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


@router.get("/prompt/{prompt_id}")
def get_public_prompt_detail(
    prompt_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_optional_user),
):
    """Devuelve el detalle de un prompt, su metadata, y las imágenes relacionadas (Colección y Usuario)"""

    # 1. Buscar la imagen
    prompt = session.exec(
        select(ImagePrompt).where(ImagePrompt.id == prompt_id)
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    # 2. Buscar al dueño
    user = session.exec(select(User).where(User.id == prompt.user_id)).first()

    # 3. Validar privacidad y buscar relacionadas de la Colección
    collection = None
    related_collection = []

    if prompt.collection_id:
        collection = session.exec(
            select(Collection).where(Collection.id == prompt.collection_id)
        ).first()
        if collection and collection.is_private:
            if not current_user or current_user.id != collection.user_id:
                raise HTTPException(
                    status_code=403,
                    detail="Esta imagen pertenece a una colección privada",
                )

        # Otras imágenes de esta misma colección
        related_collection = session.exec(
            select(ImagePrompt)
            .where(ImagePrompt.collection_id == prompt.collection_id)
            .where(ImagePrompt.id != prompt.id)
            .order_by(ImagePrompt.created_at.desc())
            .limit(6)
        ).all()

    # 4. Otras imágenes públicas del mismo Usuario
    statement = (
        select(ImagePrompt)
        .outerjoin(Collection, ImagePrompt.collection_id == Collection.id)
        .where(ImagePrompt.user_id == user.id)
        .where(ImagePrompt.id != prompt.id)
        .where(or_(ImagePrompt.collection_id == None, Collection.is_private == False))
        .order_by(ImagePrompt.created_at.desc())
        .limit(12)
    )
    related_user = session.exec(statement).all()

    return {
        "status": "success",
        "prompt": prompt,
        "user": {"username": user.username, "role": user.role},
        "collection": collection,
        "related_collection": related_collection,
        "related_user": related_user,
    }


@router.get("/feed")
def get_public_feed(session: Session = Depends(get_session), limit: int = 50):
    """Devuelve un mix de Prompts sueltos y Colecciones para la Home (Estilo Pinterest)"""

    # 1. Colecciones Públicas
    collections = session.exec(
        select(Collection, User)
        .join(User, Collection.user_id == User.id)
        .where(Collection.is_private == False)
        .order_by(Collection.created_at.desc())
        .limit(limit)
    ).all()

    # 2. Prompts sueltos públicos
    prompts = session.exec(
        select(ImagePrompt, User)
        .join(User, ImagePrompt.user_id == User.id)
        .where(ImagePrompt.collection_id == None)
        .order_by(ImagePrompt.created_at.desc())
        .limit(limit)
    ).all()

    feed = []

    # Formatear Colecciones
    for col, user in collections:
        cover = session.exec(
            select(ImagePrompt)
            .where(ImagePrompt.collection_id == col.id)
            .order_by(ImagePrompt.created_at.desc())
            .limit(1)
        ).first()

        items = session.exec(
            select(ImagePrompt).where(ImagePrompt.collection_id == col.id)
        ).all()

        feed.append(
            {
                "type": "collection",
                "id": f"col_{col.id}",
                "raw_id": col.id,
                "created_at": str(col.created_at),  # 🛡️ Convertido a texto
                "title": col.name,
                "slug": col.slug,
                "username": user.username,
                "image_url": cover.image_url if cover else None,
                "items_count": len(items),
            }
        )

    # Formatear Prompts
    for p, user in prompts:
        feed.append(
            {
                "type": "prompt",
                "id": f"prompt_{p.id}",
                "raw_id": p.id,
                "created_at": str(p.created_at),  # 🛡️ Convertido a texto
                "title": p.title,
                "prompt": p.prompt,
                "username": user.username,
                "image_url": p.image_url,
                "model": p.model,
                "resolution": p.resolution,
            }
        )

    # Ordenar cronológicamente
    feed.sort(key=lambda x: x["created_at"], reverse=True)

    return {"status": "success", "feed": feed[:limit]}
