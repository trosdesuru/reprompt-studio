import re
import unicodedata
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.collection import Collection
from app.models.prompt import ImagePrompt

router = APIRouter()


class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False


class AssignPrompt(BaseModel):
    collection_id: Optional[int]


def create_unique_slug(name: str, user_id: int, session: Session) -> str:
    """Genera un slug seguro, quitando tildes y añadiendo número si hay colisión."""
    name_normalized = (
        unicodedata.normalize("NFKD", name).encode("ASCII", "ignore").decode("utf-8")
    )

    # 2. Limpiar caracteres raros y espacios por guiones
    base_slug = (
        re.sub(r"[^a-z0-9]+", "-", name_normalized.lower()).strip("-") or "coleccion"
    )

    slug = base_slug
    counter = 1

    # 3. Evitar colisiones (si ya tienes otra que se llame igual)
    while session.exec(
        select(Collection).where(Collection.user_id == user_id, Collection.slug == slug)
    ).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


@router.post("/")
def create_collection(
    data: CollectionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    slug = create_unique_slug(data.name, current_user.id, session)

    nueva_coleccion = Collection(
        user_id=current_user.id,
        name=data.name,
        slug=slug,
        description=data.description,
        is_private=data.is_private,
    )

    session.add(nueva_coleccion)
    session.commit()
    session.refresh(nueva_coleccion)

    return {
        "status": "success",
        "message": "Colección creada",
        "collection": nueva_coleccion,
    }


@router.get("/")
def get_my_collections(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(Collection)
        .where(Collection.user_id == current_user.id)
        .order_by(Collection.created_at.desc())
    )
    colecciones = session.exec(statement).all()
    return {"status": "success", "collections": colecciones}


@router.put("/assign/{prompt_id}")
def assign_prompt_to_collection(
    prompt_id: int,
    data: AssignPrompt,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    prompt = session.exec(
        select(ImagePrompt).where(
            ImagePrompt.id == prompt_id, ImagePrompt.user_id == current_user.id
        )
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt no encontrado")

    # Validamos que la colección sea suya si no es None
    if data.collection_id:
        col = session.exec(
            select(Collection).where(
                Collection.id == data.collection_id,
                Collection.user_id == current_user.id,
            )
        ).first()
        if not col:
            raise HTTPException(status_code=404, detail="Colección no encontrada")

    prompt.collection_id = data.collection_id
    session.add(prompt)
    session.commit()

    return {"status": "success", "message": "Imagen movida correctamente"}
