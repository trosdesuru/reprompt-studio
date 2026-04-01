import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prompt import ImagePrompt
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
        new_prompt = ImagePrompt(
            user_id=current_user.id,
            title=prompt_in.title,
            prompt=prompt_in.prompt,
            negative_prompt=prompt_in.negative_prompt,
            software=prompt_in.software,
            model=prompt_in.model,
            sampler=prompt_in.sampler,
            steps=prompt_in.steps,
            cfg_scale=prompt_in.cfg_scale,
            seed=prompt_in.seed,
            resolution=prompt_in.resolution,
            image_url=prompt_in.image_url,
            extra_data=prompt_in.extra_data,
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
            select(ImagePrompt)
            .where(ImagePrompt.user_id == current_user.id)
            .order_by(ImagePrompt.created_at.desc())
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


@router.delete("/{prompt_id}")
def delete_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        # <-- ACTUALIZADO
        prompt = session.get(ImagePrompt, prompt_id)
        if not prompt or prompt.user_id != current_user.id:
            raise HTTPException(
                status_code=404, detail="Prompt no encontrado o acceso denegado."
            )

        session.delete(prompt)
        session.commit()
        return {"status": "success", "message": "Prompt eliminado del búnker."}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error borrando prompt {prompt_id}: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar el prompt.")
