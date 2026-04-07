import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import UniqueConstraint
from datetime import datetime, timezone


class Collection(SQLModel, table=True):
    """Agrupación lógica de ImagePrompts (Galerías del usuario)"""

    # Pero dos usuarios diferentes SÍ pueden tener la colección "cyberpunk".
    __table_args__ = (
        UniqueConstraint("user_id", "slug", name="unique_user_collection_slug"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)

    name: str = Field(nullable=False)
    slug: str = Field(index=True, nullable=False)
    description: Optional[str] = Field(default=None)

    is_private: bool = Field(default=False)
    share_token: Optional[str] = Field(default=None, index=True, unique=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
