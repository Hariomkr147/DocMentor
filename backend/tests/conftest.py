"""Shared test fixtures for DocMentor AI tests."""

import os
import tempfile
from pathlib import Path

# Force embedding model off during tests (uses hash-based fallback)
os.environ.setdefault('DOCMENTOR_LOAD_EMBEDDING_MODEL', 'false')
# Use a temp database for tests
os.environ.setdefault('DATABASE_URL', 'sqlite:///./data/test.db')
