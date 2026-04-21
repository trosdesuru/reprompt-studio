# app/services/wd14_service.py
import os
import cv2
import numpy as np
import pandas as pd
import onnxruntime as rt
import urllib.request
import logging
import threading
from typing import List, Tuple
import requests

logger = logging.getLogger("wd14_service")


class WD14Tagger:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(WD14Tagger, cls).__new__(cls)
                cls._instance._initialize()
            return cls._instance

    def _initialize(self):
        self.model_name = "SmilingWolf/wd-swinv2-tagger-v3"
        self.model_file = "model.onnx"
        self.csv_file = "selected_tags.csv"

        base_dir = os.environ.get("STORAGE_PATH", os.path.join(os.getcwd(), ".storage"))
        self.model_dir = os.path.join(base_dir, "models", "wd14")

        os.makedirs(self.model_dir, exist_ok=True)

        self.model_path = os.path.join(self.model_dir, self.model_file)
        self.csv_path = os.path.join(self.model_dir, self.csv_file)

        self._ensure_files_exist()

        logger.info("🏷️ [WD14] Cargando CSV de etiquetas...")
        self.tags_df = pd.read_csv(self.csv_path)
        self.tag_names = self.tags_df[self.tags_df["category"].isin([0, 4])][
            "name"
        ].tolist()
        self.tag_indices = self.tags_df[
            self.tags_df["category"].isin([0, 4])
        ].index.tolist()

        logger.info("🧠 [WD14] Cargando modelo SwinV2 en ONNX Runtime (CPU)...")
        self.ort_session = rt.InferenceSession(
            self.model_path, providers=["CPUExecutionProvider"]
        )

        self.input_name = self.ort_session.get_inputs()[0].name
        self.output_name = self.ort_session.get_outputs()[0].name

        logger.info("✅ [WD14] Modelo cargado en RAM y listo para etiquetar.")

    def _ensure_files_exist(self):
        from huggingface_hub import hf_hub_download

        if not os.path.exists(self.model_path) or not os.path.exists(self.csv_path):
            logger.info(
                f"⬇️ [WD14] Descargando modelo {self.model_name} por primera vez. Esto puede tardar un poco..."
            )

            # Descargar ONNX
            hf_hub_download(
                repo_id=self.model_name,
                filename=self.model_file,
                local_dir=self.model_dir,
                local_dir_use_symlinks=False,
            )
            # Descargar CSV
            hf_hub_download(
                repo_id=self.model_name,
                filename=self.csv_file,
                local_dir=self.model_dir,
                local_dir_use_symlinks=False,
            )
            logger.info("✅ [WD14] Descarga completada.")

    def _preprocess_image(
        self, image_bytes: bytes, target_size: int = 448
    ) -> np.ndarray:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("No se pudo decodificar la imagen.")

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        h, w = img.shape[:2]
        size = max(h, w)
        pad_h, pad_w = (size - h) // 2, (size - w) // 2

        img_padded = np.full((size, size, 3), 255, dtype=np.uint8)
        img_padded[pad_h : pad_h + h, pad_w : pad_w + w] = img

        img_resized = cv2.resize(
            img_padded, (target_size, target_size), interpolation=cv2.INTER_AREA
        )

        img_float = img_resized.astype(np.float32)

        img_float = img_float[:, :, ::-1]
        img_float = np.expand_dims(img_float, axis=0)

        return img_float

    def get_tags(self, image_url: str, threshold: float = 0.35) -> List[dict]:
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()

            input_tensor = self._preprocess_image(response.content)

            probs = self.ort_session.run(
                [self.output_name], {self.input_name: input_tensor}
            )[0][0]

            result_tags = []

            for i, p in enumerate(probs):
                if i in self.tag_indices and p >= threshold:
                    tag_name = self.tag_names[self.tag_indices.index(i)]
                    clean_tag = tag_name.replace("_", " ")

                    confidence = int(round(float(p) * 100))

                    result_tags.append({"name": clean_tag, "confidence": confidence})

            result_tags = sorted(
                result_tags, key=lambda x: x["confidence"], reverse=True
            )

            return result_tags

        except Exception as e:
            logger.error(f"❌ [WD14] Error etiquetando {image_url}: {e}")
            return []
