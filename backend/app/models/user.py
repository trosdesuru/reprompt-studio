import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
from enum import Enum


class UserRole(str, Enum):
    VOYAGER = "voyager"
    ARTIST = "artist"
    ADMIN = "admin"


class InviteCode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    code: str = Field(unique=True, index=True)
    is_used: bool = Field(default=False)
    # Opcionales
    used_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):
    """Usuarios de la plataforma con soporte Híbrido (Local / OAuth)"""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    username: str = Field(index=True, unique=True, nullable=False)
    role: UserRole = Field(default=UserRole.VOYAGER)

    # Soporte para Google Auth
    email: Optional[str] = Field(default=None, index=True, unique=True)
    auth_provider: str = Field(default="local")
    provider_id: Optional[str] = Field(default=None, index=True)

    hashed_password: Optional[str] = Field(default=None)

    role: str = Field(default="voyager")
    avatar_url: Optional[str] = Field(default=None)
    storage_used: int = Field(default=0)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)


class AuditLog(SQLModel, table=True):
    """Registro inmutable de auditoría del sistema"""

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    action: str
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
