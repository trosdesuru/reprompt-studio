import uuid
import re
from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.models.directory import Directory
from pydantic import BaseModel


class DirectoryCreate(BaseModel):
    name: str
    parent_id: Optional[uuid.UUID] = None


class DirectoryMove(BaseModel):
    parent_id: Optional[uuid.UUID] = None


class DirectoryService:
    @staticmethod
    def create_directory(
        session: Session, user: User, data: DirectoryCreate
    ) -> Directory:
        existing = session.exec(
            select(Directory).where(
                Directory.user_id == user.id,
                Directory.parent_id == data.parent_id,
                Directory.name == data.name,
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=400, detail="Ya existe una carpeta con ese nombre."
            )

        clean_name = re.sub(r"[^a-z0-9]+", "-", data.name.lower().strip())
        unique_slug = f"{clean_name.strip('-')}-{uuid.uuid4().hex[:6]}"

        nuevo_dir = Directory(
            user_id=user.id,
            name=data.name,
            parent_id=data.parent_id,
            slug=unique_slug,
        )
        session.add(nuevo_dir)
        session.commit()
        session.refresh(nuevo_dir)
        return nuevo_dir

    @staticmethod
    def get_directories(session: Session, user: User) -> List[Directory]:
        return session.exec(select(Directory).where(Directory.user_id == user.id)).all()

    @staticmethod
    def delete_directory(session: Session, user: User, directory_id: uuid.UUID):
        dir_to_delete = session.exec(
            select(Directory).where(
                Directory.id == directory_id, Directory.user_id == user.id
            )
        ).first()

        if not dir_to_delete:
            raise HTTPException(status_code=404, detail="Carpeta no encontrada")

        try:
            session.delete(dir_to_delete)
            session.commit()
            return {"status": "success", "message": "Carpeta eliminada"}

        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="DIRECTORY_NOT_EMPTY")

    @staticmethod
    def rename_directory(
        session: Session, user: User, directory_id: uuid.UUID, new_name: str
    ):
        directory = session.get(Directory, directory_id)
        if not directory or directory.user_id != user.id:
            raise HTTPException(status_code=404, detail="Directorio no encontrado")

        if new_name:
            directory.name = new_name
            session.add(directory)
            session.commit()

        return {"status": "success", "message": "Renombrado con éxito"}

    @staticmethod
    def move_directory(
        session: Session, user: User, directory_id: uuid.UUID, data: DirectoryMove
    ):
        dir_to_move = session.exec(
            select(Directory).where(
                Directory.id == directory_id, Directory.user_id == user.id
            )
        ).first()

        if not dir_to_move:
            raise HTTPException(status_code=404, detail="Carpeta no encontrada")

        if data.parent_id == directory_id:
            raise HTTPException(
                status_code=400, detail="No puedes mover una carpeta dentro de sí misma"
            )

        if data.parent_id:
            target_dir = session.exec(
                select(Directory).where(
                    Directory.id == data.parent_id, Directory.user_id == user.id
                )
            ).first()
            if not target_dir:
                raise HTTPException(
                    status_code=404, detail="Carpeta destino no encontrada"
                )

        dir_to_move.parent_id = data.parent_id
        session.add(dir_to_move)
        session.commit()
        session.refresh(dir_to_move)

        return {"status": "success", "message": "Carpeta movida", "data": dir_to_move}
