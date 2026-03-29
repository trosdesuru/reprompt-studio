from sqlmodel import SQLModel, Field, Column, JSON, String
from sqlalchemy import Text  # 🟢 NUEVO: Importamos Text directamente de SQLAlchemy
from typing import Optional, Dict, Any
from datetime import datetime


class SavedPrompt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    prompt: str
    negative_prompt: Optional[str] = Field(default=None)
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
