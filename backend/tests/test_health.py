def test_health():
    from backend.app.main import health
    assert health() == {'status': 'ok'}
