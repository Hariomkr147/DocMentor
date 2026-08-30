from pydantic import BaseModel

class DocumentOut(BaseModel):
    id: str
    filename: str
    original_filename: str
    content_hash: str
    file_type: str
    file_size: int
    page_count: int
    status: str
    created_at: str
    updated_at: str
    error_message: str | None = None
