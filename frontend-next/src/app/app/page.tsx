'use client';

import { useState, useEffect, useRef } from 'react';
import { api, DocumentInfo, ChatResponse, Citation } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
};

export default function Home() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [mode, setMode] = useState<string>('ask');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.chat(userMessage.content, selectedDocs, mode, sessionId);
      setSessionId(res.session_id);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to get a response from DocMentor.');
      // Remove the user message if it failed, or show error message inline. 
      // We will just show error inline as an AI message.
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ ' + (err.response?.data?.detail || err.message || 'Failed to connect.'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans">
      <Sidebar
        documents={documents}
        selectedDocs={selectedDocs}
        onSelectionChange={setSelectedDocs}
        onRefresh={fetchDocuments}
      />

      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            <h1 className="font-semibold text-lg">DocMentor AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-slate-100 border-none text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="ask">💬 Ask</option>
              <option value="explain">🧠 Explain</option>
              <option value="summarize">📝 Summarize</option>
              <option value="study">🎯 Study Plan</option>
              <option value="quiz">❓ Quiz Me</option>
              <option value="compare">⚖️ Compare</option>
            </select>
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setSessionId(null); }}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear Chat
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to DocMentor</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Upload your PDFs and text files in the sidebar, then ask me questions. I'll provide answers backed by exact source citations.
              </p>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                {['Summarize the key concepts', 'Create a 5-day study plan', 'Explain this to a beginner'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-3 text-sm text-left bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-slate-600"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} {...msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10">
          <div className="max-w-4xl mx-auto">
            {error && !messages.length && (
              <div className="mb-3 text-red-500 text-sm flex items-center justify-center gap-1 bg-red-50 p-2 rounded-lg">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="relative bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedDocs.length > 0
                    ? `Ask about ${selectedDocs.length} selected document(s)...`
                    : 'Ask a question...'
                }
                disabled={isLoading}
                className="w-full pl-6 pr-14 py-5 outline-none bg-transparent text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-xs text-slate-400 font-medium">
                DocMentor AI uses Gemini 3.5 Flash Lite • Uploaded documents are stored locally
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
