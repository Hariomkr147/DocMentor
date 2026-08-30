import re
from backend.app.models.domain import Chunk

def normalize_text(text: str) -> str:
    return re.sub(r"[ \t]+", " ", re.sub(r"\n{3,}", "\n\n", text)).strip()

def split_pages(pages: list[dict], chunk_size: int = 800, chunk_overlap: int = 120) -> list[Chunk]:
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")
    out, idx = [], 0
    for page in pages:
        text = normalize_text(page.get("text", ""))
        if not text:
            continue
        start = 0
        while start < len(text):
            end = min(len(text), start + chunk_size)
            piece = text[start:end].strip()
            if piece:
                out.append(Chunk(f"{page['document_id']}_chunk_{idx:04d}", page['document_id'], int(page.get('page', 1)), idx, piece, page['source']))
                idx += 1
            if end >= len(text):
                break
            start = max(0, end - chunk_overlap)
    return out
