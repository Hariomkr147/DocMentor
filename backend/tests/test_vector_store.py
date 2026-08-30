from backend.app.rag.embeddings import EmbeddingProvider
from backend.app.rag.vector_store import VectorStore
from backend.app.models.domain import Chunk

def test_store_search_and_filter(tmp_path):
    store = VectorStore(tmp_path, EmbeddingProvider('missing-local-test-model'))
    store.add([Chunk('a', 'doc-a', 1, 0, 'apples oranges fruit', 'a.txt'), Chunk('b', 'doc-b', 1, 0, 'quantum physics energy', 'b.txt')])
    result = store.search('apples fruit', 2, ['doc-a'])
    assert len(result) == 1 and result[0]['document_id'] == 'doc-a'
