import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint


class Directory(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "user_id", "parent_id", "name", name="unique_folder_name_per_level"
        ),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    name: str = Field(nullable=False)

    slug: Optional[str] = Field(default=None, index=True, unique=True)

    parent_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="directory.id", index=True
    )

    is_private: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
