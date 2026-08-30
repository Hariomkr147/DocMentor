'use client';

import { DocumentInfo, api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Sidebar({
  documents,
  selectedDocs,
  onSelectionChange,
  onRefresh,
}: {
  documents: DocumentInfo[];
  selectedDocs: string[];
  onSelectionChange: (ids: string[]) => void;
  onRefresh: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    e.stopPropagation(); // prevent selecting when clicking delete
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
      className="w-80 h-full bg-slate-50 border-r border-slate-200 flex flex-col"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="text-indigo-600" />
          Workspace
        </h2>
        <p className="text-sm text-slate-500 mt-1">Manage your knowledge base</p>
      </div>

      <div className="px-6 pb-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-100 hover:border-indigo-400 transition-colors"
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
            <div className="flex flex-col items-center gap-2 text-indigo-600">
              <RefreshCw className="animate-spin" size={24} />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <UploadCloud size={24} />
              <span className="text-sm font-medium">Click to upload PDF or TXT</span>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-3 text-red-500 text-sm flex items-center gap-1 bg-red-50 p-2 rounded-lg">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
        <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-2">
          <span>Documents ({documents.length})</span>
          {selectedDocs.length > 0 && (
            <button
              onClick={() => onSelectionChange([])}
              className="text-indigo-600 hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>
        
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
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2 overflow-hidden">
                    {isReady ? (
                      <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-500 mt-1 shrink-0" />
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-slate-800 text-sm truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </span>
                      <span className="text-xs text-slate-500">
                        {doc.page_count} pages • {(doc.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {documents.length === 0 && !isUploading && (
          <div className="text-center text-slate-400 text-sm py-8">
            No documents yet. Upload one to start.
          </div>
        )}
      </div>
    </motion.div>
  );
}
