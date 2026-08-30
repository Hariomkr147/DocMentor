import hashlib
from pathlib import Path
from backend.app.rag.splitter import split_pages

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def extract_pages(path: Path, document_id: str, file_type: str) -> list[dict]:
    if file_type == 'pdf':
        import fitz
        doc = fitz.open(path)
        return [{'text': page.get_text(), 'document_id': document_id, 'source': path.name, 'page': i + 1} for i, page in enumerate(doc)]
    return [{'text': path.read_text(encoding='utf-8', errors='ignore'), 'document_id': document_id, 'source': path.name, 'page': 1}]

def ingest(path: Path, document_id: str, file_type: str, chunk_size: int, overlap: int):
    pages = extract_pages(path, document_id, file_type)
    return pages, split_pages(pages, chunk_size, overlap)
