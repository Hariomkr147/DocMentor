# DocMentor AI 🧠

DocMentor AI is an intelligent document understanding platform tailored for students, researchers, and professionals. It allows you to upload documents (PDFs, text files), semantically search through them, and chat with an AI assistant that cites exact sources for every claim.

## 🚀 Features

* **Intelligent Document Ingestion:** Upload multiple PDFs and text files seamlessly.
* **Semantic Vector Search:** Powered by `BAAI/bge-small-en-v1.5` embeddings, DocMentor precisely matches your questions to the most relevant chunks in your documents.
* **Instant Answers with Citations:** Powered by Google's Gemini 3.5 Flash Lite, every answer is synthesized with exact page and chunk citations.
* **Local Privacy First:** Your documents remain securely on your local file system and SQLite database.
* **Modern Interface:** A sleek Next.js (App Router) interface with a dark-themed landing page and an intuitive, animated workspace.

## 🛠️ Tech Stack

* **Frontend:** Next.js 14, React 18, Tailwind CSS v4, Framer Motion, Lucide React.
* **Backend:** FastAPI (Python), Uvicorn.
* **AI & Embeddings:** Gemini API (Google), SentenceTransformers, FAISS.
* **Database:** SQLite (for document metadata and chat sessions).

## 📦 Project Structure

```
DocMentor/
├── backend/                  # FastAPI backend
│   ├── app/                  # Application code (routes, RAG logic, services)
│   ├── tests/                # Pytest suite
│   ├── main.py               # Entry point
│   └── requirements.txt      # Python dependencies
├── frontend-next/            # Next.js frontend application
│   ├── src/app/              # Next.js App Router (Landing page, Workspace)
│   ├── src/components/       # React components (Sidebar, ChatMessage)
│   ├── src/lib/api.ts        # Axios API client
│   └── package.json          # Node dependencies
├── frontend/                 # Legacy Streamlit app (Deprecated)
└── .env                      # Environment variables
```

## 🏁 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* A Google Gemini API Key

### 1. Backend Setup
1. Open a terminal and navigate to the project root.
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Set your environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DOCMENTOR_LOAD_EMBEDDING_MODEL=true
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
   ```

### 2. Frontend Setup
1. Open a second terminal and navigate to the `frontend-next` directory:
   ```bash
   cd frontend-next
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Usage
Navigate to **http://localhost:3000** in your web browser. You will see the DocMentor landing page. Click **"Get Started"** to enter the workspace, upload some documents, and start asking questions!

## 🧪 Testing

The backend includes a comprehensive pytest suite covering the document ingestion and chat flow.
```bash
python -m pytest backend/tests/
```

## 📝 License

This project is licensed under the MIT License.
