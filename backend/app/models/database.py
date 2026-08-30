import sqlite3
from pathlib import Path
from backend.app.config import settings

def db_path() -> Path:
    return Path(settings.database_url.removeprefix("sqlite:///"))

def get_conn() -> sqlite3.Connection:
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db() -> None:
    with get_conn() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, filename TEXT, original_filename TEXT, content_hash TEXT UNIQUE, file_type TEXT, file_size INTEGER, page_count INTEGER, status TEXT, created_at TEXT, updated_at TEXT, error_message TEXT);
        CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created_at TEXT, updated_at TEXT, title TEXT);
        CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE, role TEXT, content TEXT, created_at TEXT, retrieved_sources TEXT, latency_ms REAL, model_name TEXT);
        """)
