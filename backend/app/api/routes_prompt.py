import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import SavedPrompt
from app.schemas.prompt import PromptCreate, PromptResponse

logger = logging.getLogger("api_prompts")
router = APIRouter()


@router.post("/save")
def save_prompt(
    prompt_in: PromptCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        steps_val = (
            int(prompt_in.steps)
            if prompt_in.steps and prompt_in.steps.isdigit()
            else None
        )

        cfg_val = None
        if prompt_in.cfg_scale:
            try:
                cfg_val = float(prompt_in.cfg_scale)
            except ValueError:
                pass

        new_prompt = SavedPrompt(
            title=prompt_in.title,
            prompt=prompt_in.prompt,
            negative_prompt=prompt_in.negative_prompt,
            software=prompt_in.software,
            model=prompt_in.model,
            sampler=prompt_in.sampler,
            steps=steps_val,
            cfg_scale=cfg_val,
            seed=prompt_in.seed,
            resolution=prompt_in.resolution,
            extra_data=prompt_in.extra_data,
            user_id=current_user.id,
        )

        session.add(new_prompt)
        session.commit()
        session.refresh(new_prompt)

        return {
            "status": "success",
            "message": "Prompt guardado en el Búnker",
            "id": new_prompt.id,
        }

    except Exception as e:
        session.rollback()
        logger.error(f"Error guardando prompt: {e}")
        raise HTTPException(
            status_code=500, detail="Error interno al guardar en la base de datos."
        )


@router.get("/", response_model=List[PromptResponse])
def get_my_prompts(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        statement = (
            select(SavedPrompt)
            .where(SavedPrompt.user_id == current_user.id)
            .order_by(SavedPrompt.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        prompts = session.exec(statement).all()
        return prompts

    except Exception as e:
        logger.error(f"Error obteniendo prompts para usuario {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail="Error interno al recuperar los datos."
        )
