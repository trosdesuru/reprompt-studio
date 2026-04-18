import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_, func
from sqlalchemy import select as sa_select
from app.core.db import get_session
from app.models.user import User

from app.models.directory import Directory
from app.models.prompt import ImagePrompt
from app.api.deps import get_optional_user
from typing import Optional

router = APIRouter()


@router.get("/profile/{username}")
def get_public_profile(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    directories = session.exec(
        select(Directory)
        .where(Directory.user_id == user.id)
        .where(Directory.is_private == False)
    ).all()

    statement = (
        select(ImagePrompt)
        .outerjoin(Directory, ImagePrompt.directory_id == Directory.id)
        .where(ImagePrompt.user_id == user.id)
        .where(or_(ImagePrompt.directory_id == None, Directory.is_private == False))
        .order_by(ImagePrompt.created_at.desc())
        .limit(50)
    )
    prompts = session.exec(statement).all()

    return {
        "status": "success",
        "user": {
            "username": user.username,
            "role": user.role.value if hasattr(user.role, "value") else user.role,
        },
        "directories": directories,
        "recent_prompts": prompts,
    }


@router.get("/profile/{username}/{directory_slug}")
def get_public_directory(
    username: str,
    directory_slug: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_optional_user),
):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    directory = session.exec(
        select(Directory)
        .where(Directory.user_id == user.id)
        .where(Directory.slug == directory_slug)
        .where(Directory.is_private == False)
    ).first()

    if not directory:
        raise HTTPException(
            status_code=404, detail="Directorio no encontrado o es privado"
        )

    if directory.is_private:
        if not current_user or current_user.id != directory.user_id:
            raise HTTPException(status_code=403, detail="Este directorio es privado.")

    prompts = session.exec(
        select(ImagePrompt)
        .where(ImagePrompt.directory_id == directory.id)
        .order_by(ImagePrompt.created_at.desc())
    ).all()

    return {
        "status": "success",
        "user": {"username": user.username},
        "directory": directory,
        "prompts": prompts,
    }


@router.get("/prompt/{prompt_id}")
def get_public_prompt_detail(
    prompt_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_optional_user),
):
    prompt = session.exec(
        select(ImagePrompt).where(ImagePrompt.id == prompt_id)
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    user = session.exec(select(User).where(User.id == prompt.user_id)).first()

    directory = None
    related_directory = []

    if prompt.directory_id:
        directory = session.exec(
            select(Directory).where(Directory.id == prompt.directory_id)
        ).first()
        if directory and directory.is_private:
            if not current_user or current_user.id != directory.user_id:
                raise HTTPException(status_code=403, detail="Imagen privada")

        related_directory = session.exec(
            select(ImagePrompt)
            .where(ImagePrompt.directory_id == prompt.directory_id)
            .where(ImagePrompt.id != prompt.id)
            .order_by(ImagePrompt.created_at.desc())
            .limit(6)
        ).all()

    statement = (
        select(ImagePrompt)
        .outerjoin(Directory, ImagePrompt.directory_id == Directory.id)
        .where(ImagePrompt.user_id == user.id)
        .where(ImagePrompt.id != prompt.id)
        .where(or_(ImagePrompt.directory_id == None, Directory.is_private == False))
        .order_by(ImagePrompt.created_at.desc())
        .limit(12)
    )
    related_user = session.exec(statement).all()

    return {
        "status": "success",
        "prompt": prompt,
        "user": {"username": user.username, "role": user.role},
        "directory": directory,
        "related_directory": related_directory,
        "related_user": related_user,
    }


@router.get("/feed")
def get_public_feed(
    include_self: bool = False,
    limit: int = 50,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_optional_user),
):
    subq_count = (
        sa_select(func.count(ImagePrompt.id))
        .where(ImagePrompt.directory_id == Directory.id)
        .correlate(Directory)
        .scalar_subquery()
    )

    subq_cover = (
        sa_select(ImagePrompt.image_url)
        .where(ImagePrompt.directory_id == Directory.id)
        .order_by(ImagePrompt.created_at.desc())
        .limit(1)
        .correlate(Directory)
        .scalar_subquery()
    )

    query_dir = (
        select(
            Directory,
            User,
            subq_count.label("items_count"),
            subq_cover.label("cover_url"),
        )
        .join(User, Directory.user_id == User.id)
        .where(Directory.is_private == False)
    )

    query_prompt = (
        select(ImagePrompt, User)
        .join(User, ImagePrompt.user_id == User.id)
        .where(ImagePrompt.directory_id == None)
    )

    if current_user and not include_self:
        query_dir = query_dir.where(User.id != current_user.id)
        query_prompt = query_prompt.where(User.id != current_user.id)

    directories = session.exec(
        query_dir.order_by(Directory.created_at.desc()).limit(limit)
    ).all()

    prompts = session.exec(
        query_prompt.order_by(ImagePrompt.created_at.desc()).limit(limit)
    ).all()

    feed = []

    for d, user, items_count, cover_url in directories:
        feed.append(
            {
                "type": "directory",
                "id": f"dir_{d.id}",
                "raw_id": d.id,
                "created_at": str(d.created_at),
                "title": d.name,
                "slug": d.slug,
                "username": user.username,
                "image_url": cover_url,
                "items_count": items_count or 0,
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
