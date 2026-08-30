from backend.app.rag.splitter import split_pages

def test_chunking_preserves_metadata():
    chunks = split_pages([{'text': 'a ' * 100, 'document_id': 'd1', 'source': 'x.txt', 'page': 3}], 20, 5)
    assert chunks and all(c.document_id == 'd1' and c.page_number == 3 for c in chunks)
