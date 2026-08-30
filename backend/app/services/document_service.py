import uuid
from pathlib import Path
from backend.app.config import settings
from backend.app.models.database import get_conn
from backend.app.models.domain import now_iso
from backend.app.services.ingestion_service import sha256_bytes, ingest

class DocumentService:
    def __init__(self, store): self.store = store; settings.ensure_dirs()
    def list(self):
        with get_conn() as c: return [dict(r) for r in c.execute("SELECT * FROM documents WHERE status != 'deleted' ORDER BY created_at DESC")]
    def get(self, did):
        with get_conn() as c:
            row = c.execute('SELECT * FROM documents WHERE id=?', (did,)).fetchone()
            return dict(row) if row else None
    def upload(self, filename: str, data: bytes):
        ext = Path(filename).suffix.lower()
        if ext not in {'.pdf', '.txt'}: raise ValueError('Unsupported file type. Use PDF or TXT.')
        if not data: raise ValueError('Empty file')
        if len(data) > settings.max_upload_mb * 1024 * 1024: raise OverflowError('File exceeds maximum upload size')
        digest = sha256_bytes(data)
        with get_conn() as c:
            old = c.execute("SELECT * FROM documents WHERE content_hash=?", (digest,)).fetchone()
            if old:
                if old['status'] != 'deleted':
                    return dict(old)
                else:
                    c.execute("DELETE FROM documents WHERE content_hash=?", (digest,))
        did, safe, now = str(uuid.uuid4()), f'{uuid.uuid4()}{ext}', now_iso()
        path = settings.upload_dir / safe; path.write_bytes(data)
        with get_conn() as c: c.execute('INSERT INTO documents VALUES (?,?,?,?,?,?,?,?,?,?,?)', (did, safe, filename, digest, ext[1:], len(data), 0, 'processing', now, now, None))
        try:
            pages, chunks = ingest(path, did, ext[1:], settings.chunk_size, settings.chunk_overlap); self.store.add(chunks)
            with get_conn() as c: c.execute("UPDATE documents SET page_count=?,status='ready',updated_at=? WHERE id=?", (len(pages), now_iso(), did))
        except Exception as exc:
            with get_conn() as c: c.execute("UPDATE documents SET status='failed',error_message=?,updated_at=? WHERE id=?", (str(exc), now_iso(), did))
            raise
        return self.get(did)
    def delete(self, did):
        doc = self.get(did)
        if not doc: return False
        (settings.upload_dir / doc['filename']).unlink(missing_ok=True)
        self.store.remove_documents({did})
        with get_conn() as c: c.execute("UPDATE documents SET status='deleted',updated_at=? WHERE id=?", (now_iso(), did))
        return True
