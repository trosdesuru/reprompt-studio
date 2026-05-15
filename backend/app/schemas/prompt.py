import uuid
import html
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from fastapi import Form


class PromptCreate(BaseModel):
    title: str = Field(default="Generación IA", max_length=150)
    prompt: str = Field(..., max_length=20000)
    negative_prompt: Optional[str] = Field(None, max_length=20000)
    software: Optional[str] = Field(default="Desconocido", max_length=50)
    model: Optional[str] = Field(None, max_length=150)
    sampler: Optional[str] = Field(None, max_length=100)
    steps: Optional[str] = Field(None, max_length=20)
    cfg_scale: Optional[str] = Field(None, max_length=20)
    seed: Optional[str] = Field(None, max_length=50)
    resolution: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = Field(None, max_length=500)
    extra_data: Dict[str, Any] = {}


class PromptResponse(PromptCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    prompt: str = Field(..., max_length=20000)
    directory_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


def prompt_form_dependency(
    title: str = Form("Generación IA", max_length=150),
    prompt: str = Form(..., max_length=20000),
    negative_prompt: Optional[str] = Form(None, max_length=20000),
    software: Optional[str] = Form("Desconocido", max_length=50),
    model: Optional[str] = Form(None, max_length=150),
    sampler: Optional[str] = Form(None, max_length=100),
    steps: Optional[str] = Form(None, max_length=20),
    cfg_scale: Optional[str] = Form(None, max_length=20),
    seed: Optional[str] = Form(None, max_length=50),
    resolution: Optional[str] = Form(None, max_length=50),
) -> PromptCreate:
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


class BulkMoveRequest(BaseModel):
    prompt_ids: List[uuid.UUID]
    directory_id: Optional[str] = None


class BatchDeleteRequest(BaseModel):
    prompt_ids: List[uuid.UUID]


class PresignedUrlRequest(BaseModel):
    file_name: str
    content_type: str


class PromptPatchRequest(BaseModel):
    directory_id: Optional[str] = None
    title: Optional[str] = Field(None, max_length=150)
    prompt: Optional[str] = Field(None, max_length=20000)
    negative_prompt: Optional[str] = Field(None, max_length=20000)
    software: Optional[str] = Field(None, max_length=50)
    model: Optional[str] = Field(None, max_length=150)
    sampler: Optional[str] = Field(None, max_length=100)
    steps: Optional[str] = Field(None, max_length=20)
    cfg_scale: Optional[str] = Field(None, max_length=20)
    seed: Optional[str] = Field(None, max_length=50)
    resolution: Optional[str] = Field(None, max_length=50)


class StudioSaveRequest(BaseModel):
    title: str = Field(..., max_length=150)
    image_url: str = Field(..., description="URL temporal en R2")
    directory_id: Optional[str] = None
    prompt: Optional[str] = Field(None, max_length=20000)
    negative_prompt: Optional[str] = Field(None, max_length=20000)
    software: Optional[str] = Field("Desconocido", max_length=50)
    model: Optional[str] = Field(None, max_length=150)
    sampler: Optional[str] = Field(None, max_length=100)
    steps: Optional[str] = Field(None, max_length=20)
    cfg_scale: Optional[str] = Field(None, max_length=20)
    seed: Optional[str] = Field(None, max_length=50)
    width: Optional[int] = None
    height: Optional[int] = None
    resolution: Optional[str] = Field(None, max_length=50)
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("title", "prompt", "negative_prompt", mode="before")
    @classmethod
    def sanitize_text(cls, value: Optional[str]) -> Optional[str]:
        if not value:
            return value
        cleaned = value.strip()
        if "<script" in cleaned.lower() or "javascript:" in cleaned.lower():
            raise ValueError("Contenido bloqueado por seguridad.")
        return html.escape(cleaned)
