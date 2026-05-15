import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone


class GalleryMetric(SQLModel, table=True):

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)

    url: str = Field(index=True, unique=True, nullable=False)
    title: str
    thumb: str | None = None

    views: int = Field(default=0)
    downloads: int = Field(default=0)

    last_accessed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
