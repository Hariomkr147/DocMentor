import time
from backend.app.rag.prompts import SYSTEM_PROMPT, build_prompt

def generate_answer(question: str, results: list[dict], mode: str, gemini_key: str, openrouter_key: str, model: str) -> tuple[str, float, str]:
    context = '\n\n'.join(f"[{r['source']} p.{r['page']}] {r['text']}" for r in results) if results else ''
    prompt = f"{SYSTEM_PROMPT}\n\n{build_prompt(question, context, mode)}" if context else question
    started = time.perf_counter()
    import httpx
    
    try:
        if model.startswith('openrouter/'):
            if not openrouter_key: return "OpenRouter API key not configured.", (time.perf_counter() - started) * 1000, 'error'
            or_model = model.removeprefix('openrouter/')
            response = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {openrouter_key}"},
                json={"model": or_model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2},
                timeout=60
            )
            response.raise_for_status()
            text = response.json()['choices'][0]['message']['content']
            return text, (time.perf_counter() - started) * 1000, model
        elif gemini_key:
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            response = httpx.post(endpoint, params={'key': gemini_key}, json={'contents': [{'role': 'user', 'parts': [{'text': prompt}]}], 'generationConfig': {'temperature': 0.2}}, timeout=60)
            response.raise_for_status()
            text = response.json()['candidates'][0]['content']['parts'][0]['text']
            return text, (time.perf_counter() - started) * 1000, model
    except Exception as exc:
        error_type = type(exc).__name__
        if hasattr(exc, 'response') and exc.response is not None:
            print(f"API Error: {exc.response.text}")
        return local_answer(results, mode) if results else f"API Error: {error_type}", (time.perf_counter() - started) * 1000, f'error:{error_type}'
    return local_answer(results, mode) if results else "No API key configured for chat.", (time.perf_counter() - started) * 1000, 'local-fallback'

def local_answer(results: list[dict], mode: str) -> str:
    context = '\n\n'.join(f"• {r['text']} ({r['source']}, page {r['page']})" for r in results)
    if mode == 'study':
        return f"Here is a study guide assembled from your documents:\n\n{context}\n\nNext step: review each source passage, then ask me to quiz you."
    if mode == 'quiz':
        return f"Quiz material from your documents:\n\n{context}\n\nAsk a follow-up such as ‘make this multiple choice’ for a focused quiz."
    if mode == 'summarize':
        return f"Key passages from your documents:\n\n{context}"
    return f"I found these relevant passages in your documents:\n\n{context}\n\nAdd a Gemini API key for a synthesized answer grounded in these sources."
