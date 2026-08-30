def citations(results: list[dict]) -> list[dict]:
    seen, out = set(), []
    for r in results:
        key = (r['document_id'], r['page'], r['chunk_id'])
        if key not in seen:
            seen.add(key)
            out.append({'document_id': r['document_id'], 'filename': r['source'], 'page': r['page'], 'chunk_id': r['chunk_id'], 'score': round(r['score'], 4)})
    return out
