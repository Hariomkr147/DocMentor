import time
from backend.app.rag.prompts import SYSTEM_PROMPT, build_prompt

def generate_answer(question: str, results: list[dict], mode: str, api_key: str, model: str) -> tuple[str, float, str]:
    if not results:
        return "I couldn't find enough information in the uploaded documents to answer that confidently.", 0.0, 'none'
    context = '\n\n'.join(f"[{r['source']} p.{r['page']}] {r['text']}" for r in results)
    started = time.perf_counter()
    if api_key:
        try:
            import httpx
            prompt = f"{SYSTEM_PROMPT}\n\n{build_prompt(question, context, mode)}"
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            response = httpx.post(endpoint, params={'key': api_key}, json={'contents': [{'role': 'user', 'parts': [{'text': prompt}]}], 'generationConfig': {'temperature': 0.2}}, timeout=60)
            response.raise_for_status()
            payload = response.json()
            text = payload['candidates'][0]['content']['parts'][0]['text']
            return text, (time.perf_counter() - started) * 1000, model
        except Exception as exc:
            # Keep the user-facing answer grounded, while making the failure
            # diagnosable in the metadata returned by the API/UI.
            error_type = type(exc).__name__
            return local_answer(results, mode), (time.perf_counter() - started) * 1000, f'gemini-error:{error_type}'
    return local_answer(results, mode), (time.perf_counter() - started) * 1000, 'local-fallback'

def local_answer(results: list[dict], mode: str) -> str:
    context = '\n\n'.join(f"• {r['text']} ({r['source']}, page {r['page']})" for r in results)
    if mode == 'study':
        return f"Here is a study guide assembled from your documents:\n\n{context}\n\nNext step: review each source passage, then ask me to quiz you."
    if mode == 'quiz':
        return f"Quiz material from your documents:\n\n{context}\n\nAsk a follow-up such as ‘make this multiple choice’ for a focused quiz."
    if mode == 'summarize':
        return f"Key passages from your documents:\n\n{context}"
    return f"I found these relevant passages in your documents:\n\n{context}\n\nAdd a Gemini API key for a synthesized answer grounded in these sources."
