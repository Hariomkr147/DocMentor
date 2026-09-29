'use client';

import { DocumentInfo, api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, UploadCloud, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Sidebar({
  documents,
  selectedDocs,
  onSelectionChange,
  onRefresh,
  currentSessionId,
  onLoadSession,
  onNewChat,
}: {
  documents: DocumentInfo[];
  selectedDocs: string[];
  onSelectionChange: (ids: string[]) => void;
  onRefresh: () => void;
  currentSessionId?: string | null;
  onLoadSession?: (id: string) => void;
  onNewChat?: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{id: string; title: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getSessions().then(setSessions).catch(console.error);
  }, [currentSessionId]); // Refresh when a new session is created

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      await api.uploadDocument(file);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteDocument(id);
      onSelectionChange(selectedDocs.filter((d) => d !== id));
      onRefresh();
    } catch (err: any) {
      setError('Failed to delete document');
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedDocs.includes(id)) {
      onSelectionChange(selectedDocs.filter((d) => d !== id));
    } else {
      onSelectionChange([...selectedDocs, id]);
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 h-full bg-[#101014] border-r border-white/5 flex flex-col text-slate-200"
    >
      <div className="p-4 border-b border-white/5">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Conversations
          </div>
          <div className="space-y-1">
            {sessions.map(s => (
              <div key={s.id} className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                s.id === currentSessionId ? 'bg-[#1A1A24] text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}>
                <button
                  onClick={() => onLoadSession?.(s.id)}
                  className="flex-1 flex items-center gap-2 truncate text-left"
                >
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="truncate">{s.title || 'New conversation'}</span>
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await api.deleteSession(s.id);
                      setSessions(sessions.filter(session => session.id !== s.id));
                      if (currentSessionId === s.id && onNewChat) onNewChat();
                    } catch (err) {
                      console.error('Failed to delete session', err);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-slate-600 text-xs text-center py-2">No history yet</div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <span>Documents ({documents.length})</span>
            {selectedDocs.length > 0 && (
              <button
                onClick={() => onSelectionChange([])}
                className="text-indigo-400 hover:underline normal-case"
              >
                Clear
              </button>
            )}
          </div>
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-white/20 rounded-xl p-3 text-center cursor-pointer hover:bg-white/5 hover:border-indigo-400/50 transition-colors mb-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.txt"
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400">
                <RefreshCw className="animate-spin" size={18} />
                <span className="text-xs font-medium">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <UploadCloud size={18} />
                <span className="text-xs">Click to upload docs</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mb-3 text-red-400 text-xs flex items-center gap-1 bg-red-950/30 p-2 rounded-lg">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <AnimatePresence>
              {documents.map((doc) => {
                const isSelected = selectedDocs.includes(doc.id);
                const isReady = doc.status === 'ready';

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={doc.id}
                    onClick={() => toggleSelect(doc.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-white/10 bg-[#15151D] hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2 overflow-hidden">
                        {isReady ? (
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-slate-300 text-sm truncate" title={doc.original_filename}>
                            {doc.original_filename}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {doc.page_count} pages • {(doc.file_size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, doc.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
