import axios from 'axios';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BACKEND_URL,
});

export interface DocumentInfo {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  page_count: number;
  status: string;
}

export interface Citation {
  document_id: string;
  filename: string;
  page: number;
  chunk_id: string;
  score: number;
}

export interface ChatResponse {
  session_id: string;
  answer: string;
  citations: Citation[];
  metadata: { model?: string; [key: string]: any };
}

export const api = {
  async getStatus() {
    const res = await apiClient.get('/status');
    return res.data;
  },

  async getDocuments(): Promise<DocumentInfo[]> {
    const res = await apiClient.get('/documents');
    return res.data;
  },

  async uploadDocument(file: File): Promise<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async deleteDocument(id: string) {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  },

  async getSessions() {
    const res = await apiClient.get('/sessions');
    return res.data;
  },

  async deleteSession(id: string) {
    const res = await apiClient.delete(`/sessions/${id}`);
    return res.data;
  },

  async getSessionMessages(sessionId: string) {
    const res = await apiClient.get(`/sessions/${sessionId}/messages`);
    return res.data;
  },

  async chat(
    question: string,
    documentIds: string[],
    mode: string,
    sessionId?: string | null,
    model?: string
  ): Promise<ChatResponse> {
    const res = await apiClient.post('/chat', {
      question,
      document_ids: documentIds,
      mode,
      session_id: sessionId,
      model,
    });
    return res.data;
  },
};
