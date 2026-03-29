from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class PromptCreate(BaseModel):
    title: str = "Generación IA"
    prompt: str
    negative_prompt: Optional[str] = None
    software: Optional[str] = "Desconocido"
    model: Optional[str] = None
    sampler: Optional[str] = None
    steps: Optional[str] = None
    cfg_scale: Optional[str] = None
    seed: Optional[str] = None
    resolution: Optional[str] = None
    extra_data: Dict[str, Any] = {}


class PromptResponse(PromptCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
