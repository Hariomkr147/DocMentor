from backend.app.rag.citations import citations

def test_citations():
    value = citations([{'document_id': 'd', 'page': 1, 'chunk_id': 'c', 'source': 'a.pdf', 'score': .9}])
    assert value[0]['filename'] == 'a.pdf'
