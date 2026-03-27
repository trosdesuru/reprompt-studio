from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class InviteCode(SQLModel, table=True):
    """Códigos de un solo uso para acceder a la plataforma"""
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True, nullable=False)
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_by_id: Optional[int] = Field(default=None, foreign_key="user.id")

class User(SQLModel, table=True):
    """Usuarios de la plataforma con RBAC (Roles)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    role: str = Field(default="voyager") # voyager, artist, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)