from typing import Optional, Dict, Any
from sqlmodel import Field, SQLModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone


class SavedPrompt(SQLModel, table=True):
    """Tabla para almacenar los metadatos extraídos de imágenes generadas por IA"""

    id: Optional[int] = Field(default=None, primary_key=True)

    title: str = Field(default="Sin Título")
    prompt: str = Field(nullable=False)
    negative_prompt: Optional[str] = None
    software: Optional[str] = Field(default="Desconocido", index=True)

    model: Optional[str] = Field(default=None, index=True)
    sampler: Optional[str] = None
    steps: Optional[int] = None
    cfg_scale: Optional[float] = None
    seed: Optional[str] = None
    resolution: Optional[str] = None

    extra_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))

    image_url: Optional[str] = None
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
