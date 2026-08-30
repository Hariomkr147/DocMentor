from dataclasses import dataclass
from datetime import datetime, timezone

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

@dataclass
class Chunk:
    chunk_id: str
    document_id: str
    page_number: int
    chunk_index: int
    text: str
    source_filename: str
