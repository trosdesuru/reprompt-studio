import logging
import threading
from fastembed import TextEmbedding

logger = logging.getLogger(__name__)


class EmbeddingService:
    _model = None
    _lock = threading.Lock()

    @classmethod
    def get_model(cls):
        if cls._model is None:
            with cls._lock:
                if cls._model is None:
                    logger.info("Inicializando modelo FastEmbed en memoria global")
                    cls._model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        return cls._model

    @classmethod
    def generate_vector(cls, texto: str) -> list[float]:
        try:
            if not texto:
                return [0.0] * 384

            model = cls.get_model()

            embeddings = list(model.embed([texto]))
            return embeddings[0].tolist()

        except Exception as e:
            logger.exception(f"❌ Error generando vector para '{texto}': {e}")
            return [0.0] * 384
