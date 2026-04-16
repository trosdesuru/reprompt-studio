import logging
from typing import List
from fastembed import TextEmbedding

logger = logging.getLogger("embedding_service")


class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            logger.info("📡 Cargando modelo de embeddings local (FastEmbed)...")
            cls._model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        return cls._model

    @classmethod
    def generate_vector(cls, text: str) -> List[float]:
        """Convierte cualquier texto en un vector de 384 dimensiones"""
        if not text:
            return []

        try:
            model = cls.get_model()
            embeddings = list(model.embed([text]))
            return embeddings[0].tolist()
        except Exception as e:
            logger.error(f"❌ Error generando vector: {e}")
            return []
