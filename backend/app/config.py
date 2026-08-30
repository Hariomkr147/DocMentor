from dataclasses import dataclass
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

def _model_name() -> str:
    raw = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip().lower()
    aliases = {
        "1.5 flash": "gemini-1.5-flash",
        "gemini 1.5 flash": "gemini-1.5-flash",
        "2.0 flash": "gemini-2.0-flash",
        "gemini 2.0 flash": "gemini-2.0-flash",
        "2.5 flash": "gemini-2.5-flash",
        "gemini 2.5 flash": "gemini-2.5-flash",
        "2.5 flash lite": "gemini-3.5-flash-lite",
        "gemini 2.5 flash lite": "gemini-3.5-flash-lite",
        "gemini-2.5-flash-lite": "gemini-3.5-flash-lite",
        "3.5 flash": "gemini-2.5-flash",
        "gemini 3.5 flash": "gemini-2.5-flash",
        "3.5 flash lite": "gemini-3.5-flash-lite",
        "gemini 3.5 flash lite": "gemini-3.5-flash-lite",
    }
    return aliases.get(raw, raw)

def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default

@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    gemini_model: str = _model_name()
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
    app_env: str = os.getenv("APP_ENV", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    backend_port: int = _int("BACKEND_PORT", 8000)
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")
    upload_dir: Path = Path(os.getenv("UPLOAD_DIR", "./data/uploads"))
    vectorstore_dir: Path = Path(os.getenv("VECTORSTORE_DIR", "./data/vectorstores"))
    chunk_size: int = _int("CHUNK_SIZE", 800)
    chunk_overlap: int = _int("CHUNK_OVERLAP", 120)
    top_k: int = _int("TOP_K", 5)
    max_upload_mb: int = _int("MAX_UPLOAD_MB", 25)
    retrieval_score_threshold: float | None = None
    enable_reranking: bool = os.getenv("ENABLE_RERANKING", "false").lower() == "true"

    def ensure_dirs(self) -> None:
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.vectorstore_dir.mkdir(parents=True, exist_ok=True)
        Path("data").mkdir(exist_ok=True)

settings = Settings()
_threshold = os.getenv("RETRIEVAL_SCORE_THRESHOLD", "").strip()
if _threshold:
    object.__setattr__(settings, "retrieval_score_threshold", float(_threshold))
