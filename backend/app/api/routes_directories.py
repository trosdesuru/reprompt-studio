import uuid
from typing import List, Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.directory import Directory

from app.services.directory_service import (
    DirectoryService,
    DirectoryCreate,
    DirectoryMove,
)

router = APIRouter()


@router.post("/", response_model=Directory)
def create_directory(
    data: DirectoryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    return DirectoryService.create_directory(session, current_user, data)


@router.get("/", response_model=List[Directory])
def get_directories(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    return DirectoryService.get_directories(session, current_user)


@router.delete("/{directory_id}")
def delete_directory(
    directory_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    return DirectoryService.delete_directory(session, current_user, directory_id)


@router.patch("/{directory_id}")
def rename_directory(
    directory_id: uuid.UUID,
    data: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    return DirectoryService.rename_directory(
        session, current_user, directory_id, data.get("name")
    )


@router.patch("/{directory_id}/move")
def move_directory(
    directory_id: uuid.UUID,
    data: DirectoryMove,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    return DirectoryService.move_directory(session, current_user, directory_id, data)
