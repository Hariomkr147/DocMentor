"""End-to-end test: upload a document, then ask a question about it."""

import io
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_upload_txt_and_chat():
    """Upload a .txt file, verify it's indexed, then chat about its contents."""
    content = (
        "Chapter 1: Machine Learning Basics\n"
        "Machine learning is a subset of artificial intelligence that enables systems "
        "to learn from data. Supervised learning uses labeled examples. "
        "Unsupervised learning discovers hidden patterns without labels.\n\n"
        "Chapter 2: Neural Networks\n"
        "A neural network consists of layers of interconnected nodes. "
        "The input layer receives data, hidden layers process it, "
        "and the output layer produces predictions."
    )

    # 1. Upload
    resp = client.post(
        '/documents/upload',
        files={'file': ('ml_notes.txt', io.BytesIO(content.encode()), 'text/plain')},
    )
    assert resp.status_code == 200, f"Upload failed: {resp.text}"
    doc = resp.json()
    assert doc['status'] == 'ready'
    assert doc['original_filename'] == 'ml_notes.txt'
    doc_id = doc['id']

    # 2. Verify document appears in list
    resp = client.get('/documents')
    assert resp.status_code == 200
    doc_ids = [d['id'] for d in resp.json()]
    assert doc_id in doc_ids

    # 3. Ask a question
    resp = client.post('/chat', json={
        'question': 'What is machine learning?',
        'document_ids': [doc_id],
        'mode': 'ask',
    })
    assert resp.status_code == 200, f"Chat failed: {resp.text}"
    data = resp.json()
    assert data['answer'], "Answer should not be empty"
    assert data['session_id'], "Session ID should be returned"
    assert isinstance(data['citations'], list)
    # The citations should reference the uploaded document
    cited_doc_ids = [c['document_id'] for c in data['citations']]
    assert doc_id in cited_doc_ids, f"Expected {doc_id} in citations, got {cited_doc_ids}"

    # 4. Clean up — delete document
    resp = client.delete(f'/documents/{doc_id}')
    assert resp.status_code == 200


def test_upload_rejects_unsupported_type():
    """Verify that uploading a .docx file is rejected."""
    resp = client.post(
        '/documents/upload',
        files={'file': ('test.docx', io.BytesIO(b'fake docx'), 'application/vnd.openxmlformats')},
    )
    assert resp.status_code == 415


def test_upload_rejects_empty_file():
    """Verify that uploading an empty file is rejected."""
    resp = client.post(
        '/documents/upload',
        files={'file': ('empty.txt', io.BytesIO(b''), 'text/plain')},
    )
    assert resp.status_code == 415


def test_chat_requires_question():
    """Verify chat endpoint validates request body."""
    resp = client.post('/chat', json={})
    assert resp.status_code == 422
