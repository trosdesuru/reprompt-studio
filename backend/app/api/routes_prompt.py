import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import SavedPrompt
from app.schemas.prompt import PromptCreate

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
