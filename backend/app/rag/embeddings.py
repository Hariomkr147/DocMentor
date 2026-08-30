import hashlib
import os
from pathlib import Path
import numpy as np

class EmbeddingProvider:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self._model = None
        self._attempted = False

    def _load(self) -> None:
        if self._attempted:
            return
        self._attempted = True
        # Avoid an implicit multi-hundred-MB network download during API startup.
        # Set DOCMENTOR_LOAD_EMBEDDING_MODEL=true or provide a local model path
        # when running with a provisioned Sentence Transformers model.
        if os.getenv('DOCMENTOR_LOAD_EMBEDDING_MODEL', 'false').lower() != 'true' and not Path(self.model_name).exists():
            return
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
        except Exception:
            self._model = None

    def encode(self, texts: list[str]) -> np.ndarray:
        self._load()
        if self._model is not None:
            return self._model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
        arr = []
        for text in texts:
            v = np.zeros(384, dtype=np.float32)
            for token in text.lower().split():
                v[int(hashlib.sha256(token.encode()).hexdigest(), 16) % 384] += 1
            norm = np.linalg.norm(v)
            arr.append(v / norm if norm else v)
        return np.asarray(arr)
