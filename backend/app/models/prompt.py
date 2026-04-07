import uuid
from sqlmodel import SQLModel, Field, Column, JSON
from sqlalchemy import Text
from typing import Optional, Dict, Any
from datetime import datetime


class ImagePrompt(SQLModel, table=True):
    """Almacenamiento individual de cada generación extraída"""

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)

    collection_id: Optional[int] = Field(
        default=None, foreign_key="collection.id", index=True
    )

    title: str

    prompt: str = Field(sa_column=Column(Text))
    negative_prompt: Optional[str] = Field(default=None, sa_column=Column(Text))

    software: Optional[str] = Field(default="Desconocido")
    model: Optional[str] = Field(default=None)
    sampler: Optional[str] = Field(default=None)
    steps: Optional[str] = Field(default=None)
    cfg_scale: Optional[str] = Field(default=None)
    seed: Optional[str] = Field(default=None)
    resolution: Optional[str] = Field(default=None)

    image_url: Optional[str] = Field(default=None, sa_column=Column(Text))

    extra_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
