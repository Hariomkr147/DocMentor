from pydantic import BaseModel

class Citation(BaseModel):
    document_id: str
    filename: str
    page: int
    chunk_id: str
    score: float
