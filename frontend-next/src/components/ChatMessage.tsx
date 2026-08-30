'use client';

import { Citation } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export default function ChatMessage({ role, content, citations }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  const [showSources, setShowSources] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 p-6 ${isAssistant ? 'bg-slate-50 border-y border-slate-100' : 'bg-white'}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isAssistant ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'
        }`}
      >
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>

      <div className="flex-1 space-y-4 pt-1 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{content}</p>
        </div>

        {citations && citations.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm"
            >
              {showSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {citations.length} Sources Used
            </button>

            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-2 mt-3 pt-3 border-t border-slate-200">
                    {citations.map((cit, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-indigo-100 rounded-lg p-3 text-sm shadow-sm flex flex-col gap-1 border-l-4 border-l-indigo-500"
                      >
                        <div className="font-semibold text-slate-700 flex justify-between">
                          <span>{cit.filename}</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            Score: {cit.score.toFixed(3)}
                          </span>
                        </div>
                        <div className="text-slate-500 text-xs flex gap-3">
                          <span>Page {cit.page}</span>
                          <span>Chunk ID: {cit.chunk_id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
