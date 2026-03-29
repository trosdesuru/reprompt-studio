from pydantic import BaseModel
from typing import Optional, Dict, Any


class PromptCreate(BaseModel):
    title: str = "Generación IA"
    prompt: str
    negative_prompt: Optional[str] = None
    software: Optional[str] = "Desconocido"
    model: Optional[str] = None
    sampler: Optional[str] = None
    steps: Optional[str] = None  # Lo recibimos como string y lo parsearemos
    cfg_scale: Optional[str] = None
    seed: Optional[str] = None
    resolution: Optional[str] = None
    extra_data: Dict[str, Any] = {}  # Aquí meteremos los LoRAs y Triggers
