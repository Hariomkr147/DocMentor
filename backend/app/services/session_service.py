import json, uuid
from backend.app.models.database import get_conn
from backend.app.models.domain import now_iso

class SessionService:
    def create(self, title='New conversation'):
        sid, now = str(uuid.uuid4()), now_iso()
        with get_conn() as c: c.execute('INSERT INTO sessions VALUES (?,?,?,?)', (sid, now, now, title))
        return {'id': sid, 'title': title, 'created_at': now, 'updated_at': now}
    def ensure(self, sid=None): return self.create()['id'] if not sid else sid
    def add_message(self, sid, role, content, sources=None, latency_ms=None, model_name=None):
        with get_conn() as c:
            c.execute('INSERT INTO messages VALUES (?,?,?,?,?,?,?,?)', (str(uuid.uuid4()), sid, role, content, now_iso(), json.dumps(sources or []), latency_ms, model_name)); c.execute('UPDATE sessions SET updated_at=? WHERE id=?', (now_iso(), sid))
    def messages(self, sid):
        with get_conn() as c: return [dict(r) for r in c.execute('SELECT id,role,content,created_at FROM messages WHERE session_id=? ORDER BY created_at', (sid,))]
