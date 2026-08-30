import json
import re
from pathlib import Path
import numpy as np
from backend.app.models.domain import Chunk

class VectorStore:
    """Persistent cosine-similarity store; uses FAISS when available and NumPy otherwise."""
    def __init__(self, directory: Path, embedder):
        self.directory, self.embedder = directory, embedder
        directory.mkdir(parents=True, exist_ok=True)
        self.meta_path, self.vectors_path, self.index_path = directory / 'metadata.json', directory / 'vectors.npy', directory / 'index.faiss'
        self.metadata = json.loads(self.meta_path.read_text(encoding='utf-8')) if self.meta_path.exists() else []
        self.vectors = np.load(self.vectors_path) if self.vectors_path.exists() else np.empty((0, 384), dtype=np.float32)
        self.index = None
        try:
            import faiss
            if self.index_path.exists():
                self.index = faiss.read_index(str(self.index_path))
            elif len(self.vectors):
                self.index = faiss.IndexFlatIP(self.vectors.shape[1]); self.index.add(self.vectors)
        except Exception:
            self.index = None
    def save(self):
        np.save(self.vectors_path, self.vectors)
        self.meta_path.write_text(json.dumps(self.metadata, ensure_ascii=False, indent=2), encoding='utf-8')
        if self.index is not None:
            import faiss
            faiss.write_index(self.index, str(self.index_path))
    def add(self, chunks: list[Chunk]):
        if not chunks: return
        vectors = self.embedder.encode([c.text for c in chunks])
        self.vectors = np.vstack([self.vectors, vectors]) if len(self.vectors) else vectors
        self.metadata.extend(c.__dict__ for c in chunks)
        try:
            import faiss
            if self.index is None:
                self.index = faiss.IndexFlatIP(vectors.shape[1])
            self.index.add(vectors)
        except Exception:
            self.index = None
        self.save()
    def remove_documents(self, ids: set[str]):
        keep = [i for i, m in enumerate(self.metadata) if m['document_id'] not in ids]
        self.vectors = self.vectors[keep] if keep else np.empty((0, self.vectors.shape[1] if self.vectors.ndim == 2 else 384), dtype=np.float32)
        self.metadata = [self.metadata[i] for i in keep]
        try:
            import faiss
            self.index = faiss.IndexFlatIP(self.vectors.shape[1] if len(self.vectors) else 384)
            if len(self.vectors): self.index.add(self.vectors)
        except Exception:
            self.index = None
        self.save()
    def search(self, query: str, top_k: int, document_ids: list[str] | None = None, score_threshold: float | None = None):
        if not self.metadata: return []
        query_vector = self.embedder.encode([query])[0]
        query_terms = set(re.findall(r"[a-zA-Z0-9]{3,}", query.lower()))
        if self.index is not None and not document_ids:
            distances, positions = self.index.search(query_vector.reshape(1, -1), min(top_k, len(self.metadata)))
            candidates = [int(i) for i in positions[0] if i >= 0]
            scores = distances[0]
            score_map = {int(i): float(score) for i, score in zip(positions[0], scores) if i >= 0}
        else:
            scores = self.vectors @ query_vector
            score_map = {i: float(scores[i]) for i in range(len(self.metadata))}
            candidates = [i for i, m in enumerate(self.metadata) if not document_ids or m['document_id'] in document_ids]
            # The lexical component makes offline/local retrieval useful for exact
            # terms while retaining semantic similarity when a model is available.
            for i in candidates:
                terms = set(re.findall(r"[a-zA-Z0-9]{3,}", self.metadata[i]['text'].lower()))
                overlap = len(query_terms & terms) / max(len(query_terms), 1)
                score_map[i] = 0.65 * score_map[i] + 0.35 * overlap
            candidates = sorted(candidates, key=lambda i: score_map[i], reverse=True)[:top_k]
        results = [{**self.metadata[i], 'score': score_map[i], 'page': self.metadata[i]['page_number'], 'source': self.metadata[i]['source_filename']} for i in candidates]
        return [result for result in results if score_threshold is None or result['score'] >= score_threshold]
