import Link from 'next/link';
import { ArrowUpRight, BookOpen, Search, Zap, Layers, Lock, FileText, ChevronDown } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DocMentor AI - The confluence for your documents',
  description: 'AI-powered document understanding, retrieval, and study plans.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between h-16 px-1 md:px-0">
          <Link href="/" className="group flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center transition group-hover:opacity-80">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-[0.18em] text-white">DOCMENTOR</span>
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition">Features</a>
            <a href="#workflow" className="text-sm text-slate-400 hover:text-white transition">Workflow</a>
            <a href="#faq" className="text-sm text-slate-400 hover:text-white transition">FAQ</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/app" className="hidden sm:inline-flex text-sm text-slate-400 hover:text-white transition">
              Sign in
            </Link>
            <Link 
              href="/app"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              Get Started <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pb-20 pt-32 md:px-6 md:pb-28 md:pt-44">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center gap-8 md:gap-12">
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-[clamp(3.25rem,8.6vw,7.75rem)] font-black leading-[0.9] tracking-[-0.04em] text-white">
                Read the docs.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Lose the chaos.</span>
              </h1>
              <p className="mt-8 mx-auto max-w-2xl text-lg leading-8 text-slate-400 md:text-xl md:leading-9">
                DocMentor brings PDF ingestion, deep semantic search, exact citations, and AI-powered study plans into one intelligent system for students and researchers.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/app"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white text-black px-8 text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Start your workspace <ArrowUpRight size={16} />
                </Link>
                <a 
                  href="#features"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-white/10 px-8 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Explore features
                </a>
              </div>
            </div>
            
            <div className="w-full text-center mt-8 animate-in fade-in duration-1000 delay-300">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-indigo-400 uppercase">See it in action</p>
            </div>
            
            {/* Mock Dashboard Preview */}
            <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#101014] shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <div className="h-8 border-b border-white/10 bg-[#16161A] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <div className="aspect-[16/9] w-full bg-[#0A0A0C] flex">
                <div className="w-64 border-r border-white/10 hidden md:block p-4 space-y-4">
                  <div className="h-8 rounded bg-white/5 w-full" />
                  <div className="h-4 rounded bg-white/5 w-3/4" />
                  <div className="h-4 rounded bg-white/5 w-1/2" />
                  <div className="h-4 rounded bg-white/5 w-5/6" />
                </div>
                <div className="flex-1 p-8 flex flex-col gap-6">
                  <div className="h-12 w-3/4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 self-start p-4" />
                  <div className="h-32 w-4/5 bg-white/5 rounded-2xl self-end p-4" />
                  <div className="h-12 w-1/2 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 self-start p-4" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative px-4 py-12 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
            {[
              { num: '50M+', label: 'vectors indexed' },
              { num: '3.5', label: 'gemini flash lite' },
              { num: '100%', label: 'local data privacy' },
              { num: '0ms', label: 'wait for answers' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#101014] p-8 text-center md:text-left">
                <div className="font-mono text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">{stat.num}</div>
                <div className="text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 py-20 md:px-6 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl mb-16">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-indigo-400 uppercase">01 / CAPABILITIES</p>
            <h2 className="mt-4 text-5xl font-black leading-[0.92] tracking-[-0.04em] text-white md:text-7xl">
              Six modules.<br />One intelligent brain.
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: 'Semantic Search', desc: 'Find exact concepts across hundreds of pages using BAAI embeddings.', col: 'md:col-span-2' },
              { icon: Zap, title: 'Instant Answers', desc: 'Synthesized responses powered by Gemini 3.5.', col: 'md:col-span-1' },
              { icon: FileText, title: 'Exact Citations', desc: 'Every claim is backed by a page number and document chunk.', col: 'md:col-span-1' },
              { icon: Layers, title: 'Study Plans', desc: 'Automatically generate curriculums from your lecture notes.', col: 'md:col-span-1' },
              { icon: Lock, title: 'Local Privacy', desc: 'Your PDFs never leave your machine; only embeddings are computed.', col: 'md:col-span-1' },
            ].map((feat, i) => (
              <div key={i} className={`group flex flex-col justify-between rounded-2xl bg-[#101014] border border-white/5 p-8 transition hover:border-indigo-500/30 ${feat.col} min-h-[240px]`}>
                <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-indigo-400 mb-8">
                  <feat.icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-3">{feat.title}</h3>
                  <p className="text-sm leading-6 text-slate-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-24 md:px-6 md:py-40 overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-indigo-900/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-indigo-400 uppercase">READY WHEN YOU ARE</p>
          <h2 className="mt-6 text-5xl font-black leading-[0.9] tracking-[-0.04em] text-white md:text-7xl">
            Make your documents legible.
          </h2>
          <p className="mt-8 max-w-2xl mx-auto text-lg leading-8 text-slate-400">
            Stop searching through scattered PDFs. Start asking questions and getting answers.
          </p>
          <div className="mt-10">
            <Link 
              href="/app"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-white text-black px-8 text-base font-bold hover:bg-slate-200 transition-colors shadow-xl"
            >
              Enter Workspace <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 md:px-6 bg-[#0A0A0C]">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-indigo-500" />
            <span className="text-sm font-semibold tracking-widest text-white">DOCMENTOR AI</span>
          </div>
          <p className="text-xs text-slate-500">
            Built with Next.js 14, Tailwind v4, and Gemini. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
