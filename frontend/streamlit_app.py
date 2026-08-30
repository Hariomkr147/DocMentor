import os
import requests
import streamlit as st

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000').rstrip('/')
st.set_page_config(page_title='DocMentor AI', page_icon='📚', layout='wide', initial_sidebar_state='expanded')

st.markdown('''<style>
.hero { padding: 1.3rem 1.5rem; border-radius: 18px; background: linear-gradient(120deg,#172554,#312e81); color: white; margin-bottom: 1rem; }
.hero h1 { margin: 0; font-size: 2rem; } .hero p { margin: .35rem 0 0; color: #dbeafe; }
.source-card { padding: .7rem .85rem; border-left: 4px solid #6366f1; background: #f8fafc; border-radius: 8px; margin: .35rem 0; }
.muted { color: #64748b; font-size: .9rem; }
</style>''', unsafe_allow_html=True)


def api(method, path, timeout=180, **kwargs):
    """Call backend API. Returns (response, error_string)."""
    try:
        response = requests.request(method, f'{BACKEND_URL}{path}', timeout=timeout, **kwargs)
        return response, None
    except requests.ConnectionError:
        return None, 'Cannot connect to backend. Is it running?'
    except requests.Timeout:
        return None, 'Request timed out. The backend may be busy.'
    except requests.RequestException as exc:
        return None, str(exc)


if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'session_id' not in st.session_state:
    st.session_state.session_id = None

st.markdown('<div class="hero"><h1>📚 DocMentor AI</h1><p>Understand your documents, study smarter, and get answers with traceable sources.</p></div>', unsafe_allow_html=True)

# ── Sidebar ──────────────────────────────────────────────────────────
with st.sidebar:
    st.header('Your workspace')

    # Backend status
    health, health_error = api('GET', '/status', timeout=10)
    runtime = health.json() if health and health.ok else {}
    if runtime:
        st.success('Backend connected')
    else:
        st.error(health_error or 'Backend unavailable')
    if runtime.get('gemini_configured'):
        st.success(f"Gemini ready · {runtime['gemini_model']}")
    else:
        st.warning('Gemini key missing in .env. Using local fallback.')

    # Upload
    uploaded = st.file_uploader('Add a document', type=['pdf', 'txt'], help='PDF and TXT files are supported.')
    if uploaded and st.button('🚀 Index document', use_container_width=True, type='primary'):
        with st.status('Preparing your document…', expanded=True) as status:
            st.write('Uploading and indexing')
            response, error = api('POST', '/documents/upload', files={'file': (uploaded.name, uploaded.getvalue(), uploaded.type)})
            if response and response.ok:
                status.update(label='Document ready', state='complete')
                st.success(f"Indexed {response.json()['original_filename']}")
                st.rerun()
            else:
                status.update(label='Indexing failed', state='error')
                st.error(error or (response.text if response else 'Could not reach backend'))

    # Document list
    response, error = api('GET', '/documents', timeout=10)
    documents = response.json() if response and response.ok else []
    st.subheader(f'Documents ({len(documents)})')
    if documents:
        for doc in documents:
            icon = '✅' if doc['status'] == 'ready' else '⚠️'
            col1, col2 = st.columns([4, 1])
            col1.markdown(
                f"{icon} **{doc['original_filename']}**  \n"
                f"<span class='muted'>{doc['page_count']} pages · {doc['status']}</span>",
                unsafe_allow_html=True,
            )
            if col2.button('🗑️', key=f"del_{doc['id']}", help='Delete this document'):
                resp, err = api('DELETE', f"/documents/{doc['id']}", timeout=10)
                if resp and resp.ok:
                    st.rerun()
                else:
                    st.error(err or 'Delete failed')
    else:
        st.info('Upload your first PDF or TXT file to begin.')

    # Filters
    selected = st.multiselect(
        'Search only in',
        [d['id'] for d in documents],
        format_func=lambda value: next((d['original_filename'] for d in documents if d['id'] == value), value),
    )

    st.divider()

    # Mode
    mode_labels = {
        'ask': '💬 Ask',
        'explain': '🧠 Explain',
        'summarize': '📝 Summarize',
        'study': '🎯 Study plan',
        'quiz': '❓ Quiz me',
        'compare': '⚖️ Compare',
    }
    mode = st.selectbox('What would you like to do?', list(mode_labels), format_func=lambda value: mode_labels[value])
    debug = st.toggle('Show retrieval details', value=False)

    if st.button('🗑️ Clear conversation', use_container_width=True):
        st.session_state.messages = []
        st.session_state.session_id = None
        st.rerun()

# ── Metrics bar ──────────────────────────────────────────────────────
col1, col2, col3 = st.columns(3)
col1.metric('Documents', len(documents))
col2.metric('Scope', 'All' if not selected else f'{len(selected)} selected')
col3.metric('Mode', mode_labels[mode].split(' ', 1)[1])

if not documents:
    st.info('Start by uploading a document from the sidebar.')
    st.markdown('### Try asking')
    st.markdown(
        '- `Summarize the key ideas`\n'
        '- `Explain this like I am a beginner`\n'
        '- `Create a study plan`\n'
        '- `Quiz me on the important concepts`'
    )

# ── Chat history ─────────────────────────────────────────────────────
for message in st.session_state.messages:
    with st.chat_message(message['role']):
        st.markdown(message['content'])
        if message['role'] == 'assistant' and message.get('citations'):
            with st.expander('📎 Sources used', expanded=False):
                for citation in message['citations']:
                    st.markdown(
                        f"<div class='source-card'><b>{citation['filename']}</b> · page {citation['page']}"
                        f"<br><span class='muted'>Relevance score: {citation['score']:.4f}</span></div>",
                        unsafe_allow_html=True,
                    )

# ── Chat input ───────────────────────────────────────────────────────
if prompt := st.chat_input('Ask a question about your documents…'):
    st.session_state.messages.append({'role': 'user', 'content': prompt})
    with st.chat_message('user'):
        st.markdown(prompt)

    with st.chat_message('assistant'):
        with st.spinner('Reading your documents…'):
            response, error = api(
                'POST', '/chat',
                json={
                    'session_id': st.session_state.session_id,
                    'question': prompt,
                    'document_ids': selected,
                    'mode': mode,
                },
            )
        if response and response.ok:
            data = response.json()
            st.session_state.session_id = data['session_id']
            st.markdown(data['answer'])
            if data.get('citations'):
                with st.expander('📎 Sources used', expanded=True):
                    for citation in data['citations']:
                        st.markdown(
                            f"<div class='source-card'><b>{citation['filename']}</b> · page {citation['page']}"
                            f"<br><span class='muted'>Relevance score: {citation['score']:.4f}</span></div>",
                            unsafe_allow_html=True,
                        )
            if debug and data.get('metadata'):
                with st.expander('🔍 Retrieval details'):
                    st.json(data['metadata'])
            st.session_state.messages.append({
                'role': 'assistant',
                'content': data['answer'],
                'citations': data.get('citations', []),
            })
        else:
            st.error(error or (response.text if response else 'Could not reach backend'))
