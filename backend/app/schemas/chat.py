from pydantic import BaseModel, Field
from typing import Literal
from backend.app.schemas.common import Citation

class ChatRequest(BaseModel):
    session_id: str | None = None
    question: str = Field(min_length=1, max_length=10000)
    document_ids: list[str] = []
    mode: Literal["ask", "explain", "summarize", "study", "quiz", "compare"] = "ask"
    model: str | None = None

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    citations: list[Citation]
    metadata: dict

class SessionOut(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str
