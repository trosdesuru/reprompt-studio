import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
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

    def safe_extract(obj):
        if not obj:
            return None
        data = {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}
        data.pop("embedding", None)
        return data

    clean_prompts = [safe_extract(p) for p in prompts]

    return {
        "status": "success",
        "user": {
            "username": user.username,
            "role": user.role.value if hasattr(user.role, "value") else user.role,
        },
        "directories": directories,
        "recent_prompts": clean_prompts,
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

    def safe_extract(obj):
        if not obj:
            return None
        data = {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}
        data.pop("embedding", None)
        return data

    clean_prompts = [safe_extract(p) for p in prompts]

    return {
        "status": "success",
        "user": {"username": user.username},
        "directory": directory,
        "prompts": clean_prompts,
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

    def safe_extract(obj):
        if not obj:
            return None
        data = {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}
        data.pop("embedding", None)
        return data

    return {
        "status": "success",
        "prompt": safe_extract(prompt),
        "user": {"username": user.username, "role": user.role},
        "directory": safe_extract(directory),
        "related_directory": [safe_extract(p) for p in related_directory],
        "related_user": [safe_extract(p) for p in related_user],
    }


@router.get("/feed")
def get_public_feed(
    response: Response,
    include_self: bool = False,
    limit: int = 24,
    cursor: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_optional_user),
):
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=30"

    query = (
        select(ImagePrompt, User)
        .join(User, ImagePrompt.user_id == User.id)
        .outerjoin(Directory, ImagePrompt.directory_id == Directory.id)
        .where(
            or_(
                ImagePrompt.directory_id == None,
                Directory.is_private == False,
            )
        )
    )

    if current_user and not include_self:
        query = query.where(User.id != current_user.id)

    if cursor:
        try:
            cursor_dt = datetime.fromisoformat(cursor.replace("Z", "+00:00"))
            query = query.where(ImagePrompt.created_at < cursor_dt)
        except ValueError:
            pass

    query = query.order_by(ImagePrompt.created_at.desc()).limit(limit)
    results = session.exec(query).all()

    feed = []
    for p, user in results:
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
                "width": p.width,
                "height": p.height,
            }
        )

    next_cursor = feed[-1]["created_at"] if len(feed) > 0 else None

    return {
        "status": "success",
        "feed": feed,
        "next_cursor": next_cursor,
    }
