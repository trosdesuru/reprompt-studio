# backend/app/api/routes_public.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_, func
from app.core.db import get_session
from app.models.user import User
from app.models.collection import Collection
from app.models.prompt import ImagePrompt
from app.api.deps import get_optional_user, get_optional_user
from typing import Optional

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
        "user": {
            "username": user.username,
            "role": user.role.value if hasattr(user.role, "value") else user.role
        },
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
def get_public_feed(
    include_self: bool = False,
    limit: int = 50,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Devuelve un mix de Prompts sueltos y Colecciones para la Home optimizado"""

    query_col = (
        select(Collection, User)
        .join(User, Collection.user_id == User.id)
        .where(Collection.is_private == False)
    )

    query_prompt = (
        select(ImagePrompt, User)
        .join(User, ImagePrompt.user_id == User.id)
        .where(ImagePrompt.collection_id == None)
    )

    if current_user and not include_self:
        query_col = query_col.where(User.id != current_user.id)
        query_prompt = query_prompt.where(User.id != current_user.id)

    collections = session.exec(
        query_col.order_by(Collection.created_at.desc()).limit(limit)
    ).all()
    prompts = session.exec(
        query_prompt.order_by(ImagePrompt.created_at.desc()).limit(limit)
    ).all()

    feed = []

    for col, user in collections:
        count_statement = select(func.count(ImagePrompt.id)).where(
            ImagePrompt.collection_id == col.id
        )
        items_count = session.exec(count_statement).one()

        cover_url = session.exec(
            select(ImagePrompt.image_url)
            .where(ImagePrompt.collection_id == col.id)
            .order_by(ImagePrompt.created_at.desc())
            .limit(1)
        ).first()

        feed.append(
            {
                "type": "collection",
                "id": f"col_{col.id}",
                "raw_id": col.id,
                "created_at": str(col.created_at),
                "title": col.name,
                "slug": col.slug,
                "username": user.username,
                "image_url": cover_url,
                "items_count": items_count,
            }
        )

    for p, user in prompts:
        feed.append(
            {
                "type": "prompt",
                "id": f"prompt_{p.id}",
                "raw_id": p.id,
                "created_at": str(p.created_at),
                "title": p.title,
                "prompt": p.prompt,
                "username": user.username,
                "image_url": p.image_url,
                "model": p.model,
                "resolution": p.resolution,
            }
        )

    feed.sort(key=lambda x: x["created_at"], reverse=True)

    return {"status": "success", "feed": feed[:limit]}
