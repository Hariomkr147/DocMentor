# PRD: DocMentor AI v2 — Multi-Model ChatGPT-Class Platform

## Introduction

DocMentor AI is being transformed from a document-centric RAG chatbot into a **full ChatGPT-class AI platform** with multi-model support, real-time voice conversations, agentic capabilities, and document understanding as one tool among many. The existing backend (FastAPI + FAISS + SentenceTransformers) and frontend (Next.js 14 + Tailwind v4) remain the foundation.

The upgrade is **phased**:

- **Phase 1:** Fix answer formatting (`** ... **` markdown rendering), add multi-model switching (Gemini + OpenRouter), dark-mode ChatGPT-style UI overhaul, conversation history.
- **Phase 2:** Voice chat via Gemini 3.8 Live Extended Thinking, agentic mode (web browsing, code execution, tool use), Antigravity agent integration.

This PRD covers **both phases** with Phase 1 scoped for immediate implementation and Phase 2 as a follow-up spec.

---

## Goals

- Render AI responses as proper markdown (headings, bold, code blocks, lists) instead of raw `** ... **` text
- Allow users to pick from multiple AI models (Gemini 3.8 Flash, 3.5 Flash Lite, OpenRouter models like Muse Spark 1.3C and JEV) per-message
- Overhaul `/app` UI to a dark-themed, ChatGPT/Claude-class design with conversation sidebar, model selector, and polished animations
- Support free-form chat (no document required) alongside document-grounded RAG
- Add real-time voice conversations using Gemini 3.8 Live Extended Thinking API (Phase 2)
- Add agentic capabilities: web browsing, code execution, tool use (Phase 2)

---

## User Stories

### Phase 1: Multi-Model Chat + UI Overhaul

---

### US-001: Render Markdown in AI Responses
**Description:** As a user, I want AI responses rendered as proper markdown (bold, headings, lists, code blocks, tables) so that answers are readable instead of showing raw `**text**`.

**Acceptance Criteria:**
- [ ] Install and use `react-markdown` + `remark-gfm` + `rehype-highlight` in ChatMessage component
- [ ] Bold, italic, headings (h1-h6), ordered/unordered lists, code blocks with syntax highlighting, tables, and blockquotes all render correctly
- [ ] Raw `** ... **` no longer appears in responses
- [ ] User messages remain plain text (no markdown rendering)
- [ ] Typecheck passes
- [ ] Verify in browser

---

### US-002: Multi-Model Backend — Model Router
**Description:** As a developer, I need the backend to route chat requests to different AI providers (Gemini API, OpenRouter API) based on a `model` parameter.

**Acceptance Criteria:**
- [ ] Add `model` field to `ChatRequest` schema (e.g., `"gemini-3.8-flash"`, `"gemini-3.5-flash-lite"`, `"openrouter/muse-spark-1.3c"`, `"openrouter/jev"`)
- [ ] Create a `ModelRouter` module that dispatches to Gemini `generateContent` API or OpenRouter `/chat/completions` API based on model prefix
- [ ] OpenRouter API key read from `OPENROUTER_API_KEY` env var
- [ ] Gemini API key read from existing `GEMINI_API_KEY` env var
- [ ] Fallback to `gemini-3.5-flash-lite` if no model specified (backward-compatible)
- [ ] Return consistent response shape regardless of provider
- [ ] Error handling: if a provider is down or key is missing, return a clear error message (not a crash)

---

### US-003: Free-Form Chat (No Documents Required)
**Description:** As a user, I want to chat with the AI without uploading any documents, just like ChatGPT.

**Acceptance Criteria:**
- [ ] When no documents are selected AND no documents exist, the chat still works by calling the model directly (no vector search step)
- [ ] When documents ARE selected, the existing RAG pipeline runs (vector search → context → model)
- [ ] The UI does not force/nag the user to upload documents before chatting
- [ ] The welcome screen offers both "Chat freely" and "Upload docs for grounded answers" options

---

### US-004: Model Selector in Chat UI
**Description:** As a user, I want to pick which AI model to use from a dropdown in the chat header, and see which model answered each message.

**Acceptance Criteria:**
- [ ] Model selector dropdown in chat header replaces the current "mode" selector (modes become a secondary option)
- [ ] Available models grouped by provider: **Gemini** (3.8 Flash, 3.5 Flash Lite), **OpenRouter** (Muse Spark 1.3C, JEV)
- [ ] Selected model persists across messages in the same session
- [ ] Each AI response bubble shows a small label of which model generated it (e.g., "Gemini 3.8 Flash")
- [ ] Model can be changed mid-conversation
- [ ] Typecheck passes
- [ ] Verify in browser

---

### US-005: Dark Mode ChatGPT-Style UI Overhaul
**Description:** As a user, I want the `/app` page to look like ChatGPT/Claude with a dark theme, matching the Sangam Club landing page aesthetic.

**Acceptance Criteria:**
- [ ] Background: `#0A0A0C` (matching landing page)
- [ ] Sidebar: dark panel (`#101014`) with conversation history list
- [ ] Chat area: dark background, messages styled with subtle borders and rounded corners
- [ ] User message bubbles: right-aligned or distinct color
- [ ] AI message bubbles: left-aligned, with model icon/avatar
- [ ] Input area: dark input box with glowing indigo focus ring at the bottom of the viewport
- [ ] Smooth framer-motion animations on message appear
- [ ] Responsive: sidebar collapses on mobile
- [ ] Typecheck passes
- [ ] Verify in browser

---

### US-006: Conversation History Sidebar
**Description:** As a user, I want a sidebar listing my past conversations so I can switch between them.

**Acceptance Criteria:**
- [ ] Left sidebar shows list of past sessions with auto-generated titles (first user message, truncated)
- [ ] "New Chat" button at the top creates a fresh session
- [ ] Clicking a past session loads its messages
- [ ] Current session is highlighted
- [ ] Sessions stored in backend SQLite (existing `sessions` table extended)
- [ ] Delete a conversation (trash icon)
- [ ] Document workspace (upload/manage docs) moved to a collapsible section or separate tab within the sidebar
- [ ] Typecheck passes
- [ ] Verify in browser

---

### US-007: Textarea Input with Shift+Enter
**Description:** As a user, I want a multi-line textarea input (like ChatGPT) so I can write longer prompts, with Shift+Enter for new lines and Enter to send.

**Acceptance Criteria:**
- [ ] Replace single-line `<input>` with auto-resizing `<textarea>`
- [ ] Enter sends the message
- [ ] Shift+Enter inserts a newline
- [ ] Textarea grows up to ~6 lines, then scrolls internally
- [ ] Typecheck passes
- [ ] Verify in browser

---

### Phase 2: Voice Chat + Agentic Mode

---

### US-008: Voice Chat with Gemini 3.8 Live Extended Thinking
**Description:** As a user, I want a voice chat button that lets me speak my question and hear the AI's response read aloud, using Gemini 3.8 Live's real-time audio API.

**Acceptance Criteria:**
- [ ] Microphone button in chat input area
- [ ] Click to start recording; click again (or silence detection) to stop
- [ ] Audio sent to Gemini 3.8 Live Extended Thinking API via WebSocket
- [ ] Response audio streamed back and played through browser speakers
- [ ] Transcript of both user speech and AI response shown in chat as text messages
- [ ] Visual indicator (waveform / pulsing circle) while recording and while AI is speaking
- [ ] Graceful fallback if mic permission denied
- [ ] Typecheck passes
- [ ] Verify in browser

---

### US-009: Agentic Mode — Web Browsing
**Description:** As a user, I want to enable an "Agent" mode where the AI can browse the web to answer questions with up-to-date information.

**Acceptance Criteria:**
- [ ] Toggle or model-selection option for "Antigravity Agent" mode
- [ ] Backend uses a tool-calling model (Gemini 3.8 Flash with function calling)
- [ ] `web_search` tool defined: takes a query, returns search results (via SerpAPI, Tavily, or direct Google Search API)
- [ ] `read_url` tool defined: fetches and parses a URL to markdown
- [ ] AI decides when to call tools based on the user's question
- [ ] Tool call results shown in the chat as collapsible "Agent Actions" blocks
- [ ] Typecheck passes

---

### US-010: Agentic Mode — Code Execution
**Description:** As a user, I want the agent to be able to write and execute Python code to answer computation questions.

**Acceptance Criteria:**
- [ ] `run_code` tool defined: executes Python code in a sandboxed subprocess and returns stdout/stderr
- [ ] Code and output shown in chat as formatted code blocks
- [ ] Timeout after 30 seconds
- [ ] No filesystem access outside a temp directory (security sandbox)
- [ ] Typecheck passes

---

## Functional Requirements

### Phase 1

- **FR-1:** ChatMessage component renders markdown using `react-markdown` with GFM support and syntax-highlighted code blocks
- **FR-2:** `ChatRequest` schema accepts an optional `model` field (string). Backend routes to the correct provider
- **FR-3:** Backend `ModelRouter` supports two providers: Gemini (via REST `generateContent`) and OpenRouter (via REST `/chat/completions`)
- **FR-4:** When `document_ids` is empty and no documents are selected, the backend skips vector search and sends the question directly to the model
- **FR-5:** Frontend model selector dropdown shows available models grouped by provider
- **FR-6:** Each AI response message stores and displays the `model` used
- **FR-7:** The `/app` page uses a dark theme (`#0A0A0C` background) with the Sangam Club design language
- **FR-8:** Sidebar shows conversation history; "New Chat" creates a new session; clicking a session loads it
- **FR-9:** Input is a `<textarea>` with Enter-to-send and Shift+Enter-for-newline
- **FR-10:** Backend `GET /sessions` endpoint returns all sessions for the conversation list
- **FR-11:** Backend `GET /sessions/{id}/messages` returns full message history for a session
- **FR-12:** Each message stored in DB includes `model` field

### Phase 2

- **FR-13:** Voice chat uses Gemini 3.8 Live Extended Thinking WebSocket API for real-time audio in/out
- **FR-14:** Agentic mode uses Gemini function calling with `web_search`, `read_url`, and `run_code` tools
- **FR-15:** Tool call results rendered as collapsible "Agent Action" UI blocks in chat
- **FR-16:** Code execution sandboxed in a subprocess with 30s timeout and restricted filesystem

---

## Non-Goals (Out of Scope)

- No user authentication or accounts (stays local/single-user)
- No billing or usage tracking for API calls
- No streaming responses in Phase 1 (full response returned at once; streaming is a future optimization)
- No mobile app (web-only, but responsive)
- No file editing or IDE features in agentic mode
- No image generation or multimodal input (text and voice only)
- No persistent agent memory across sessions

---

## Design Considerations

### UI Reference
- **ChatGPT:** Dark sidebar with conversation list, centered chat area, bottom-pinned input
- **Claude:** Clean message bubbles, model label on each response, markdown rendering
- **Sangam Club:** Dark background `#0A0A0C`, indigo accents, `font-black` headings, glassmorphic panels

### Component Reuse
- Reuse existing `Sidebar.tsx` structure but redesign for dark theme + conversation list
- Reuse existing `ChatMessage.tsx` but add markdown rendering and model label
- Reuse existing `api.ts` client but extend with `model` parameter

### Key Libraries (already installed or to add)
- `react-markdown` + `remark-gfm` + `rehype-highlight` — markdown rendering (to install)
- `framer-motion` — animations (already installed)
- `lucide-react` — icons (already installed)
- `axios` — HTTP client (already installed)

---

## Technical Considerations

### Backend

- **Model Router Pattern:** A single `generate_answer()` function dispatches to provider-specific HTTP calls. No SDK dependencies — use `httpx` (already installed) for both Gemini and OpenRouter REST APIs.
- **OpenRouter API:** Standard OpenAI-compatible `/chat/completions` endpoint at `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer $OPENROUTER_API_KEY` header.
- **Gemini 3.8 Flash:** Same `generateContent` REST endpoint pattern already used, just a different model name.
- **Session Storage:** Extend existing SQLite `sessions` table with a `title` column (auto-generated from first user message). Add `model` column to messages table.
- **Voice (Phase 2):** Gemini 3.8 Live Extended Thinking uses a WebSocket connection. Backend acts as a WebSocket proxy between the browser and Gemini Live API, or the frontend connects directly.

### Frontend

- **Markdown:** `react-markdown` with `remark-gfm` plugin handles tables, strikethrough, task lists. `rehype-highlight` handles code syntax highlighting.
- **Textarea Auto-resize:** Use a `ref` to measure `scrollHeight` and set `style.height` on change. No library needed.
- **Dark Theme:** Update `globals.css` CSS variables. All components switch to dark palette.

### Environment Variables (new)
```
OPENROUTER_API_KEY=sk-or-...
```

---

## Success Metrics

- AI responses render proper markdown (no raw `**text**` visible)
- User can switch between ≥4 models and get responses from each
- Chat works without uploading any documents
- UI matches dark ChatGPT aesthetic and feels polished
- Voice chat enables full spoken conversation with AI (Phase 2)
- Agent mode can answer "what's the weather today" by searching the web (Phase 2)

---

## Open Questions

1. **OpenRouter model names:** Need exact model IDs for Muse Spark 1.3C and JEV on OpenRouter. User to provide or we discover via `GET https://openrouter.ai/api/v1/models`.
2. **Gemini 3.8 Live API access:** Is the user's Gemini API key enabled for the Live Extended Thinking endpoint? Need to verify.
3. **Agentic web search provider:** SerpAPI, Tavily, or Google Custom Search? Each needs an API key.
4. **Streaming:** Phase 1 uses full-response mode. Should Phase 1.5 add SSE streaming for a better UX before Phase 2?
