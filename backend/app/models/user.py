import uuid

from enum import Enum
from sqlmodel import Field, SQLModel
from sqlalchemy import Column
from sqlalchemy import Enum as SAEnum

from typing import Optional
from datetime import datetime, timezone


class UserRole(str, Enum):
    VOYAGER = "voyager"
    ARTIST = "artist"
    ADMIN = "admin"


class InviteCode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    code: str = Field(unique=True, index=True)
    is_used: bool = Field(default=False)

    used_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    username: str = Field(index=True, unique=True, nullable=False)
    role: UserRole = Field(
        default=UserRole.VOYAGER,
        sa_column=Column(
            SAEnum(UserRole, values_callable=lambda obj: [e.value for e in obj]),
            nullable=False,
            server_default="voyager",
        ),
    )

    # Soporte para Google Auth
    email: Optional[str] = Field(default=None, index=True, unique=True)
    auth_provider: str = Field(default="local")
    provider_id: Optional[str] = Field(default=None, index=True)

    hashed_password: Optional[str] = Field(default=None)

    avatar_url: Optional[str] = Field(default=None)
    storage_used: int = Field(default=0)
    monthly_uploads: int = Field(default=0)
    last_reset_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)


class AuditLog(SQLModel, table=True):

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    action: str
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
