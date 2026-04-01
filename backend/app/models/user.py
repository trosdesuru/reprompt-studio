from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone


class InviteCode(SQLModel, table=True):
    """Códigos de un solo uso para acceder a la plataforma"""

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True, nullable=False)
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_by_id: Optional[int] = Field(default=None, foreign_key="user.id")


class User(SQLModel, table=True):
    """Usuarios de la plataforma con soporte Híbrido (Local / OAuth)"""

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)

    # 🟢 NUEVO: Soporte para Google Auth
    email: Optional[str] = Field(default=None, index=True, unique=True)
    auth_provider: str = Field(default="local")  # Puede ser "local" o "google"
    provider_id: Optional[str] = Field(default=None, index=True)

    # 🟢 MODIFICADO: Es opcional porque los usuarios de Google no tendrán contraseña
    hashed_password: Optional[str] = Field(default=None)

    # 🟢 NUEVO: Preparación para monetización
    tier: str = Field(default="free")  # "free" o "pro"

    role: str = Field(default="voyager")  # voyager, artist, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class AuditLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    action: str
    details: str | None = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
