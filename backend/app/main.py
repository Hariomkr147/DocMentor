from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.logging_config import configure_logging
from backend.app.models.database import init_db
from backend.app.rag.embeddings import EmbeddingProvider
from backend.app.rag.vector_store import VectorStore
from backend.app.services.document_service import DocumentService
from backend.app.services.session_service import SessionService
from backend.app.services.chat_service import ChatService
from backend.app.schemas.chat import ChatRequest, ChatResponse, SessionOut, MessageOut
from backend.app.schemas.document import DocumentOut

configure_logging(settings.log_level)
settings.ensure_dirs()
init_db()
embedder = EmbeddingProvider(settings.embedding_model)
store = VectorStore(settings.vectorstore_dir, embedder)
docs = DocumentService(store)
sessions = SessionService()
chat_service = ChatService(store, sessions, settings)
app = FastAPI(title='DocMentor AI', version='0.1.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health(): return {'status': 'ok'}

@app.get('/status')
def status():
    return {
        'status': 'ok',
        'gemini_configured': bool(settings.gemini_api_key),
        'gemini_model': settings.gemini_model,
        'embedding_mode': 'sentence-transformers' if embedder._model is not None else 'local-fallback',
        'document_count': len(docs.list()),
    }

@app.get('/documents', response_model=list[DocumentOut])
def list_documents(): return docs.list()

@app.get('/documents/{document_id}', response_model=DocumentOut)
def get_document(document_id: str):
    doc = docs.get(document_id)
    if not doc: raise HTTPException(404, 'Document not found')
    return doc

@app.post('/documents/upload', response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...)):
    try: return docs.upload(file.filename or 'upload.txt', await file.read())
    except OverflowError as exc: raise HTTPException(413, str(exc)) from exc
    except ValueError as exc: raise HTTPException(415, str(exc)) from exc
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, 'Document processing failed') from exc

@app.delete('/documents/{document_id}')
def delete_document(document_id: str):
    if not docs.delete(document_id): raise HTTPException(404, 'Document not found')
    return {'status': 'deleted', 'document_id': document_id}

@app.post('/sessions', response_model=SessionOut)
def create_session(): return sessions.create()

@app.get('/sessions', response_model=list[SessionOut])
def list_sessions(): return sessions.list()

@app.get('/sessions/{session_id}/messages', response_model=list[MessageOut])
def session_messages(session_id: str): return sessions.messages(session_id)

@app.delete('/sessions/{session_id}')
def delete_session(session_id: str):
    sessions.delete(session_id)
    return {'status': 'deleted'}

@app.post('/chat', response_model=ChatResponse)
def chat(req: ChatRequest):
    sid, answer, cites, meta = chat_service.chat(req)
    return {'session_id': sid, 'answer': answer, 'citations': cites, 'metadata': meta}
