import time
from backend.app.rag.citations import citations
from backend.app.rag.chain import generate_answer

class ChatService:
    def __init__(self, store, sessions, settings): self.store, self.sessions, self.settings = store, sessions, settings
    def chat(self, req):
        sid = self.sessions.ensure(req.session_id); self.sessions.add_message(sid, 'user', req.question)
        started = time.perf_counter()
        results = self.store.search(req.question, self.settings.top_k, req.document_ids, self.settings.retrieval_score_threshold) if req.document_ids else []
        model_to_use = req.model or self.settings.gemini_model
        answer, llm_ms, model_used = generate_answer(req.question, results, req.mode, self.settings.gemini_api_key, self.settings.openrouter_api_key, model_to_use)
        total = (time.perf_counter() - started) * 1000
        cites = citations(results); self.sessions.add_message(sid, 'assistant', answer, cites, total, model_used)
        return sid, answer, cites, {'model': model_used, 'top_k': self.settings.top_k, 'latency_ms': round(total, 2), 'retrieval_count': len(results), 'gemini_configured': bool(self.settings.gemini_api_key), 'retrieved_chunks': results}
