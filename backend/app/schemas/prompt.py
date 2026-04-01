from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import Form


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
    image_url: Optional[str] = None
    extra_data: Dict[str, Any] = {}


class PromptResponse(PromptCreate):
    id: int
    user_id: int
    created_at: datetime
    steps: Optional[int] = None
    cfg_scale: Optional[float] = None

    class Config:
        from_attributes = True


# 🟢 NUEVO: Dependencia para Clean Code en Multipart/Form-Data
def prompt_form_dependency(
    title: str = Form("Generación IA"),
    prompt: str = Form(...),
    negative_prompt: Optional[str] = Form(None),
    software: Optional[str] = Form("Desconocido"),
    model: Optional[str] = Form(None),
    sampler: Optional[str] = Form(None),
    steps: Optional[str] = Form(None),
    cfg_scale: Optional[str] = Form(None),
    seed: Optional[str] = Form(None),
    resolution: Optional[str] = Form(None),
) -> PromptCreate:
    """Extrae los campos del form-data y los valida contra el esquema PromptCreate"""
    return PromptCreate(
        title=title,
        prompt=prompt,
        negative_prompt=negative_prompt,
        software=software,
        model=model,
        sampler=sampler,
        steps=steps,
        cfg_scale=cfg_scale,
        seed=seed,
        resolution=resolution,
    )
