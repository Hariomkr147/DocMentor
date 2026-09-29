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
  model?: string;
};

const MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', group: 'Google' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', group: 'Google' },
  { id: 'antigravity-agent', name: 'Antigravity Agent', group: 'Custom' },
  { id: 'openrouter/meta/muse-spark-1.3', name: 'Muse Spark 1.3', group: 'OpenRouter' },
  { id: 'openrouter/typesafe/jev-router', name: 'JEV Router', group: 'OpenRouter' },
];

export default function Home() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [mode, setMode] = useState<string>('ask');
  const [model, setModel] = useState<string>('gemini-3.5-flash-lite');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const loadSession = async (id: string) => {
    setIsLoading(true);
    setSessionId(id);
    try {
      const msgs = await api.getSessionMessages(id);
      setMessages(msgs.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        // Optional: you can parse model from metadata if saved there
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.chat(userMessage.content, selectedDocs, mode, sessionId, model);
      setSessionId(res.session_id);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        model: res.metadata?.model || model,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to get a response from DocMentor.');
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
    <div className="flex h-screen bg-[#0A0A0C] text-slate-200 font-sans">
      <Sidebar
        documents={documents}
        selectedDocs={selectedDocs}
        onSelectionChange={setSelectedDocs}
        onRefresh={fetchDocuments}
        currentSessionId={sessionId}
        onLoadSession={loadSession}
        onNewChat={() => { setMessages([]); setSessionId(null); }}
      />

      <main className="flex-1 flex flex-col h-full bg-[#0A0A0C] relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0A0A0C]/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} />
            <h1 className="font-semibold text-lg">DocMentor AI</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#101014] border border-white/10 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-300 font-medium cursor-pointer hover:bg-[#1A1A24] transition-colors"
            >
              <optgroup label="Google">
                {MODELS.filter(m => m.group === 'Google').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
              <optgroup label="OpenRouter">
                {MODELS.filter(m => m.group === 'OpenRouter').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
              <optgroup label="Custom">
                {MODELS.filter(m => m.group === 'Custom').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            </select>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-500/10 ring-1 ring-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="text-indigo-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-2">How can I help?</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Chat freely, or select documents in the sidebar to ask questions grounded in your files.
              </p>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                {['Summarize the key concepts', 'Explain this to a beginner', 'Create a 5-day study plan'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-3 text-sm text-left bg-[#101014] border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-[#1A1A24] transition-all text-slate-400 hover:text-slate-300"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-40">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} {...msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/95 to-transparent pt-10">
          <div className="max-w-4xl mx-auto">
            {error && !messages.length && (
              <div className="mb-3 text-red-400 text-sm flex items-center justify-center gap-1 bg-red-950/30 border border-red-500/20 p-2 rounded-lg">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="relative bg-[#101014] shadow-2xl border border-white/10 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all flex items-end"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); adjustTextareaHeight(); }}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  selectedDocs.length > 0
                    ? `Ask about ${selectedDocs.length} selected document(s)...`
                    : 'Ask anything...'
                }
                disabled={isLoading}
                className="w-full pl-6 pr-14 py-4 outline-none bg-transparent text-slate-200 placeholder:text-slate-500 disabled:opacity-50 resize-none max-h-[200px]"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {selectedDocs.length > 0 && (
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="bg-transparent border-none text-xs outline-none text-slate-500 cursor-pointer hidden sm:block"
                    title="Doc Mode"
                  >
                    <option value="ask">💬 Ask</option>
                    <option value="summarize">📝 Summary</option>
                    <option value="explain">🧠 Explain</option>
                  </select>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:bg-slate-800 hover:bg-indigo-500 transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <span className="text-xs text-slate-600 font-medium">
                DocMentor AI uses {MODELS.find(m => m.id === model)?.name} • Shift+Enter for newline
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
