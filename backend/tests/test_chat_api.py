from fastapi.testclient import TestClient
from backend.app.main import app

def test_health_api():
    response = TestClient(app).get('/health')
    assert response.status_code == 200 and response.json()['status'] == 'ok'

def test_status_does_not_expose_secret():
    payload = TestClient(app).get('/status').json()
    assert 'gemini_api_key' not in payload
    assert 'gemini_configured' in payload
