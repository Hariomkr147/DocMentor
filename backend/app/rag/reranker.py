def rerank(results: list[dict], enabled: bool = False) -> list[dict]:
    """Extension point for a cross-encoder reranker; v1 preserves FAISS order."""
    return results
