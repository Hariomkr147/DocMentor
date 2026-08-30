install:
	py -m pip install -r backend/requirements.txt
backend:
	py -m uvicorn backend.app.main:app --reload --port 8000
frontend:
	py -m streamlit run frontend/streamlit_app.py
test:
	py -m pytest
