import uuid
from sqlmodel import SQLModel, Field, Column, JSON
from sqlalchemy import Text, JSON, Column
from typing import Optional, Dict, Any, List, Union
from datetime import datetime
from pgvector.sqlalchemy import Vector


class ImagePrompt(SQLModel, table=True):
    """Almacenamiento individual de cada generación extraída"""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)

    directory_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="directory.id", index=True
    )

    title: str
    prompt: str = Field(sa_column=Column(Text))
    negative_prompt: Optional[str] = Field(default=None, sa_column=Column(Text))

    embedding: Optional[List[float]] = Field(
        default=None, sa_column=Column(Vector(384))
    )

    software: Optional[str] = Field(default="Desconocido")
    model: Optional[str] = Field(default=None)
    sampler: Optional[str] = Field(default=None)
    steps: Optional[str] = Field(default=None)
    cfg_scale: Optional[str] = Field(default=None)
    seed: Optional[str] = Field(default=None)

    resolution: Optional[str] = Field(default=None)
    width: Optional[int] = Field(default=None)
    height: Optional[int] = Field(default=None)

    image_url: Optional[str] = Field(default=None, sa_column=Column(Text))
    file_size_bytes: int = Field(default=0)

    auto_tags: List[dict | str] = Field(default=[], sa_column=Column(JSON))
    extra_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
