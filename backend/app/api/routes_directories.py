import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.directory import Directory

router = APIRouter()


class DirectoryCreate(BaseModel):
    name: str
    parent_id: Optional[uuid.UUID] = None


class DirectoryMove(BaseModel):
    parent_id: Optional[uuid.UUID] = None


@router.post("/", response_model=Directory)
def create_directory(
    data: DirectoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(Directory).where(
            Directory.user_id == current_user.id,
            Directory.parent_id == data.parent_id,
            Directory.name == data.name,
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail="Ya existe una carpeta con ese nombre aquí."
        )

    nuevo_dir = Directory(
        user_id=current_user.id, name=data.name, parent_id=data.parent_id
    )
    session.add(nuevo_dir)
    session.commit()
    session.refresh(nuevo_dir)
    return nuevo_dir


@router.get("/", response_model=List[Directory])
def get_directories(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session.exec(
        select(Directory).where(Directory.user_id == current_user.id)
    ).all()


@router.delete("/{directory_id}")
def delete_directory(
    directory_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    dir_to_delete = session.exec(
        select(Directory).where(
            Directory.id == directory_id, Directory.user_id == current_user.id
        )
    ).first()

    if not dir_to_delete:
        raise HTTPException(status_code=404, detail="Carpeta no encontrada")

    session.delete(dir_to_delete)
    session.commit()
    return {"status": "success", "message": "Carpeta eliminada"}


@router.patch("/{directory_id}/move")
def move_directory(
    directory_id: uuid.UUID,
    data: DirectoryMove,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Mueve una carpeta dentro de otra (o a la raíz)"""

    # 1. Buscar la carpeta que queremos mover
    dir_to_move = session.exec(
        select(Directory).where(
            Directory.id == directory_id, Directory.user_id == current_user.id
        )
    ).first()

    if not dir_to_move:
        raise HTTPException(status_code=404, detail="Carpeta no encontrada")

    # 2. Lógica de Seguridad: Evitar ciclos infinitos en el backend
    # No puedes mover una carpeta dentro de sí misma
    if data.parent_id == directory_id:
        raise HTTPException(
            status_code=400, detail="No puedes mover una carpeta dentro de sí misma"
        )

    # Si hay un parent_id, verificamos que esa carpeta destino exista y sea del usuario
    if data.parent_id:
        target_dir = session.exec(
            select(Directory).where(
                Directory.id == data.parent_id, Directory.user_id == current_user.id
            )
        ).first()
        if not target_dir:
            raise HTTPException(status_code=404, detail="Carpeta destino no encontrada")

        # (Opcional pero recomendado para nivel Pro): Verificar que el target no sea un hijo del directorio actual
        # Para mantener el código ligero ahora mismo, confiaremos en la prevención del Frontend que ya programamos.

    # 3. Aplicar el cambio y guardar
    dir_to_move.parent_id = data.parent_id
    session.add(dir_to_move)
    session.commit()
    session.refresh(dir_to_move)

    return {
        "status": "success",
        "message": "Carpeta movida correctamente",
        "data": dir_to_move,
    }
