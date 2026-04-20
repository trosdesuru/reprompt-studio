import logging
import os
import requests
from PIL import Image
from io import BytesIO
from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    CLIPProcessor,
    CLIPModel,
)
from app.core.db import engine
from sqlmodel import Session, select
from rq import Queue, Worker
from app.models.prompt import ImagePrompt
from app.core.redis_config import conn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("rq_worker")

blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


def process_image_ai(prompt_id: str):
    with Session(engine) as session:
        prompt = session.get(ImagePrompt, prompt_id)
        if not prompt or not prompt.image_url:
            return

        try:
            response = requests.get(prompt.image_url)
            img = Image.open(BytesIO(response.content)).convert("RGB")

            inputs = blip_processor(img, return_tensors="pt")
            out = blip_model.generate(**inputs)
            caption = blip_processor.decode(out[0], skip_special_tokens=True)
            generated_tags = list(set(caption.lower().split()))

            safety_labels = ["a photo", "nsfw", "explicit", "violence", "blood"]
            inputs = clip_processor(
                text=safety_labels, images=img, return_tensors="pt", padding=True
            )
            outputs = clip_model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1)
            nsfw_prob = float(torch.sum(probs[0][1:]))

            prompt.tags = generated_tags
            prompt.nsfw_score = nsfw_prob
            prompt.is_nsfw = nsfw_prob > 0.7
            prompt.ai_processed = True

            session.add(prompt)
            session.commit()
            logger.info(f"✅ [AI] ID {prompt_id} procesado. NSFW: {nsfw_prob:.2f}")

        except Exception as e:
            logger.error(f"❌ [AI] Error en ID {prompt_id}: {e}")


if __name__ == "__main__":
    try:
        queues = [
            Queue("downloads_premium", connection=conn),
            Queue("downloads_free", connection=conn),
            Queue("ai_processing", connection=conn),
        ]

        worker = Worker(queues, connection=conn)
        logger.info("👷 Worker RQ Online. Escuchando colas de Descargas e IA.")
        worker.work()
    except Exception as e:
        logger.error(f"❌ El Worker ha muerto: {e}")
