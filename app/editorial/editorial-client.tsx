'use client';

import { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import {
  Plus, Search, ArrowLeft, LogOut,
  Sparkles, Clock, Eye, Download, Save, X,
  HelpCircle, FileText, Info, RefreshCw, Star, ArrowUpRight, Pen, Trash2,
  Settings2, Columns, LayoutGrid, Maximize2
} from 'lucide-react';
import { Article } from '@/lib/blog-service';
import { UserSession } from '@/lib/auth';
import { renderMarkdown } from '@/lib/markdown';
import Link from 'next/link';
import { CATEGORIES as CATEGORIES_LIST } from '@/lib/categories';
import { renderIllustration } from '@/components/render-illustration';

const ILLUSTRATIONS_LIST = [
  "diagram1","diagram2","diagram3","diagram4",
  "diagram5","diagram6","diagram7","diagram8"
];

interface EditorialClientProps {
  initialArticles: Article[];
  user: UserSession;
}

// ────────────────────────────────────────────────────────────
// Thumbnail — SVG illustration or cover image
// ────────────────────────────────────────────────────────────
function IllustrationThumb({ type, coverImage }: { type: string; coverImage?: string }) {
  if (coverImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full scale-[0.6] origin-center pointer-events-none opacity-80">
      {renderIllustration(type, false)}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Status badge  [Stack Sans Text — small label metadata]
// ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'draft' | 'published' | undefined }) {
  if (status === 'draft') {
    return (
      <span className="stack-sans-text inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block shrink-0" />
        Draft
      </span>
    );
  }
  return (
    <span className="stack-sans-text inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block shrink-0" />
      Live
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// Article card — Curator's Canvas feed row
// ────────────────────────────────────────────────────────────
function ArticleCard({
  post, index, onEdit, onDelete, isDeletingId,
}: {
  post: Article;
  index: number;
  onEdit: (a: Article) => void;
  onDelete: (id: number) => void;
  isDeletingId: number | null;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative flex items-center gap-6 px-5 py-5 rounded-2xl
        border transition-all duration-300 cursor-default hover:-translate-y-0.5
        ${hovered
          ? 'border-accent/40 dark:border-white/20 bg-white dark:bg-[#243347] shadow-xl shadow-accent/5 dark:shadow-[0_10px_30px_rgba(16,185,129,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)]'
          : 'border-accent/20 dark:border-white/10 bg-white dark:bg-[#1e2a3a] shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)]'
        }
      `}
    >
      {/* Left accent strip */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-accent transition-all duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

      {/* ── Thumbnail ── */}
      <div className={`
        relative shrink-0 w-[140px] h-[88px] rounded-xl overflow-hidden
        border transition-all duration-300
        ${hovered
          ? 'border-accent/40 dark:border-white/20 shadow-md shadow-accent/10'
          : 'border-accent/10 dark:border-white/5'
        }
        bg-slate-50 dark:bg-[#1a2535]
      `}>
        <IllustrationThumb type={post.illustrationType} coverImage={post.coverImage} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.featured && (
            <span className="stack-sans-text inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-[#202940] px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          <StatusBadge status={post.status} />
        </div>

        {/* Title — Google Sans Flex, prominent */}
        <p className={`
          google-sans-flex leading-snug line-clamp-1 transition-colors duration-200
          text-[18px] font-[600]
          ${hovered ? 'text-accent' : 'text-slate-900 dark:text-white'}
        `}>
          {post.title}
        </p>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="google-sans-flex text-sm text-slate-500 dark:text-white/45 line-clamp-1 font-[400]">
            {post.excerpt}
          </p>
        )}

        {/* Metadata row — Stack Sans Text for small metadata values */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="stack-sans-text text-[11px] text-slate-400 dark:text-white/30 font-medium truncate max-w-[220px]">
            /{post.slug}
          </span>
          <span className="text-slate-300 dark:text-white/10 text-sm">·</span>
          <span className="stack-sans-text flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-accent/60" /> {post.readTime}
          </span>
          <span className="text-slate-300 dark:text-white/10 text-sm">·</span>
          <span className="stack-sans-text text-[11px] text-slate-400 font-medium">{post.date}</span>
        </div>
      </div>

      {/* ── Categories — Stack Sans Text muted tags ── */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap max-w-[220px] shrink-0">
        {post.categories.slice(0, 3).map(c => (
          <span
            key={c}
            className="stack-sans-text text-[11px] font-semibold text-slate-500 dark:text-white/50 bg-slate-100 dark:bg-[#1a2535] px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/[0.10]"
          >
            {c}
          </span>
        ))}
        {post.categories.length > 3 && (
          <span className="stack-sans-text text-[11px] text-slate-400 dark:text-white/25 font-medium">
            +{post.categories.length - 3}
          </span>
        )}
      </div>

      {/* ── Hover Action Toolbar ── */}
      <div className={`
        flex items-center gap-2 shrink-0 transition-all duration-250
        ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'}
      `}>
        <button
          onClick={() => onEdit(post)}
          title="Edit Article"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-accent/10 dark:bg-[#111e2c] dark:hover:bg-accent/20 text-slate-500 hover:text-accent dark:text-white/60 dark:hover:text-accent transition-all duration-200 cursor-pointer"
        >
          <Pen className="w-4 h-4" />
        </button>
        <Link
          href={post.status === 'published' ? `/blog/${post.slug}` : `/blog?id=${post.id}`}
          target="_blank"
          title="View Article"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-accent/10 dark:bg-[#111e2c] dark:hover:bg-accent/20 text-slate-500 hover:text-accent dark:text-white/60 dark:hover:text-accent transition-all duration-200"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(post.id)}
          disabled={isDeletingId === post.id}
          title="Delete Article"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-500/10 dark:bg-[#111e2c] dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 dark:text-white/50 dark:hover:text-red-400 transition-all duration-200 cursor-pointer disabled:opacity-40"
        >
          {isDeletingId === post.id
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
            : <Trash2 className="w-4 h-4" />
          }
        </button>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────
export function EditorialClient({ initialArticles, user }: EditorialClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [hasBackupDraft, setHasBackupDraft] = useState(false);
  
  // Custom workspace view states for a more powerful editorial experience
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorLayoutMode, setEditorLayoutMode] = useState<'write' | 'split' | 'preview'>('split');

  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    setFormContent(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formReadTime, setFormReadTime] = useState('5 min read');
  const [formIllustration, setFormIllustration] = useState<Article['illustrationType']>('diagram1');
  const [formTakeaways, setFormTakeaways] = useState<string[]>(['']);
  const [formContent, setFormContent] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('edudojo_draft_autosave')) setHasBackupDraft(true);
  }, []);

  useEffect(() => {
    const wc = formContent.trim().split(/\s+/).filter(Boolean).length;
    setFormReadTime(`${Math.ceil(wc / 200) || 1} min read`);
  }, [formContent]);

  useEffect(() => {
    if (!editingArticle) { setLastAutosaved(null); return; }
    const interval = setInterval(() => {
      localStorage.setItem('edudojo_draft_autosave', JSON.stringify({
        title: formTitle, slug: formSlug, excerpt: formExcerpt,
        categories: formCategories, readTime: formReadTime,
        illustrationType: formIllustration, takeaways: formTakeaways,
        content: formContent, featured: formFeatured, status: formStatus,
        coverImage: formCoverImage, editingId: editingArticle.id
      }));
      setHasBackupDraft(true);
      setLastAutosaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 5000);
    return () => clearInterval(interval);
  }, [formTitle, formSlug, formExcerpt, formCategories, formReadTime,
      formIllustration, formTakeaways, formContent, formFeatured,
      formStatus, formCoverImage, editingArticle]);

  useEffect(() => {
    if (!editingArticle) return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; return ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [editingArticle]);

  const handleRestoreDraft = () => {
    const raw = localStorage.getItem('edudojo_draft_autosave');
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      setFormTitle(d.title || ''); setFormSlug(d.slug || '');
      setFormExcerpt(d.excerpt || ''); setFormCategories(d.categories || ['Engineering']);
      setFormReadTime(d.readTime || '5 min read'); setFormIllustration(d.illustrationType || 'diagram1');
      setFormTakeaways(d.takeaways?.length > 0 ? d.takeaways : ['']);
      setFormContent(d.content || ''); setFormFeatured(!!d.featured);
      setFormStatus(d.status || 'draft'); setFormCoverImage(d.coverImage || '');
      setEditingArticle({ id: d.editingId }); setHasBackupDraft(false);
    } catch { /* ignore */ }
  };

  const handleDiscardDraft = () => { localStorage.removeItem('edudojo_draft_autosave'); setHasBackupDraft(false); };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startNewArticle = () => {
    setFormTitle(''); setFormSlug(''); setFormExcerpt('');
    setFormCategories(['Engineering']); setFormReadTime('1 min read');
    setFormIllustration('diagram1'); setFormTakeaways(['']);
    setFormContent(''); setFormFeatured(false); setFormStatus('draft');
    setFormCoverImage(''); setEditingArticle({ id: undefined });
  };

  const startEditArticle = (article: Article) => {
    setFormTitle(article.title); setFormSlug(article.slug);
    setFormExcerpt(article.excerpt); setFormCategories(article.categories);
    setFormReadTime(article.readTime); setFormIllustration(article.illustrationType);
    setFormTakeaways(article.takeaways.length > 0 ? article.takeaways : ['']);
    setFormContent(article.content); setFormFeatured(!!article.featured);
    setFormStatus(article.status || 'published'); setFormCoverImage(article.coverImage || '');
    setEditingArticle(article);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingArticle?.id) {
      setFormSlug(val.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
    }
  };

  const updateTakeaway = (i: number, val: string) => { const n = [...formTakeaways]; n[i] = val; setFormTakeaways(n); };
  const addTakeawayField = () => setFormTakeaways([...formTakeaways, '']);
  const removeTakeawayField = (i: number) => { const n = formTakeaways.filter((_, j) => j !== i); setFormTakeaways(n.length === 0 ? [''] : n); };
  const toggleCategory = (cat: string) => setFormCategories(
    formCategories.includes(cat) ? formCategories.filter(c => c !== cat) : [...formCategories, cat]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!formTitle || !formSlug || !formContent) { alert('Please fill Title, Slug, and Content.'); return; }
    setIsSaving(true);
    try {
      const payload: Partial<Article> = {
        id: editingArticle?.id, title: formTitle, slug: formSlug,
        excerpt: formExcerpt, categories: formCategories.length > 0 ? formCategories : ['Engineering'],
        readTime: formReadTime, illustrationType: formIllustration,
        takeaways: formTakeaways.filter(t => t.trim() !== ''),
        content: formContent, featured: formFeatured, status: formStatus, coverImage: formCoverImage,
      };
      const res = await fetch('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
      localStorage.removeItem('edudojo_draft_autosave');
      setHasBackupDraft(false);
      const refresh = await fetch('/api/blog');
      if (refresh.ok) setArticles(await refresh.json());
      setEditingArticle(null);
    } catch (err: any) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this article?')) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Delete failed'); }
      setArticles(articles.filter(a => a.id !== id));
    } catch (err: any) { alert(err.message); }
    finally { setIsDeletingId(null); }
  };

  const exportJson = () => {
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(articles, null, 2));
    a.download = "articles.json"; document.body.appendChild(a); a.click(); a.remove();
  };

  const wordCount = formContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = formContent.length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const featuredCount = articles.filter(a => a.featured).length;

  return (
    <div className={`px-4 sm:px-8 md:px-12 mx-auto w-full selection:bg-accent/30 selection:text-current transition-all duration-300 ${
      editingArticle ? 'max-w-[95%] 2xl:max-w-[1680px]' : 'max-w-screen-xl'
    }`}>

      {/* ── 0. Draft Recovery Banner ── */}
      <AnimatePresence>
        {hasBackupDraft && !editingArticle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-5 bg-accent/10 dark:bg-[#152a25] border border-accent/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex gap-3 items-start">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="google-sans-flex text-base font-bold text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Recover working draft</p>
                <p className="google-sans-flex text-sm text-slate-500 dark:text-white/50 mt-0.5">An unsaved draft from your previous session is available in localStorage.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleRestoreDraft} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white google-sans-flex font-bold text-sm rounded-full transition-all cursor-pointer shadow-sm shadow-accent/20">
                <RefreshCw className="w-3.5 h-3.5" /> Restore
              </button>
              <button onClick={handleDiscardDraft} className="px-5 py-2.5 text-slate-500 google-sans-flex font-bold text-sm rounded-full hover:bg-slate-100 dark:hover:bg-[#1a2535] transition-all cursor-pointer">
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Dashboard Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200/80 dark:border-white/[0.07] pb-10 mb-10">
        <div className="space-y-3">
          <span className="stack-sans-text text-xs uppercase tracking-[0.3em] text-accent font-bold block">
            The Curator&apos;s Canvas
          </span>
          <h1 className="google-sans-flex text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 750 }}>
            Editorial Workspace
          </h1>
          {/* Stat pills */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <span className="stack-sans-text inline-flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block shrink-0" />
              {publishedCount} Published
            </span>
            <span className="stack-sans-text inline-flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-3.5 py-1.5 rounded-full text-[11px] font-bold">
              {draftCount} Draft{draftCount !== 1 ? 's' : ''}
            </span>
            {featuredCount > 0 && (
              <span className="stack-sans-text inline-flex items-center gap-1.5 bg-indigo-500/8 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-3.5 py-1.5 rounded-full text-[11px] font-bold">
                <Star className="w-3 h-3" /> {featuredCount} Featured
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white dark:bg-[#1a2535] border border-slate-200 dark:border-white/[0.10] px-4 py-2.5 rounded-full shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-accent/20" />
            <div className="leading-none">
              <p className="google-sans-flex text-sm font-bold text-slate-900 dark:text-white" style={{ fontWeight: 650 }}>{user.name}</p>
              <p className="stack-sans-text text-[11px] text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={exportJson}
            className="flex items-center gap-2 bg-white dark:bg-[#1a2535] hover:bg-slate-50 dark:hover:bg-[#243347] text-slate-700 dark:text-white google-sans-flex font-bold text-sm h-11 px-5 rounded-full border border-slate-200 dark:border-white/[0.10] shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-accent" /> Backup JSON
          </button>

          <Link
            href="/api/auth/logout"
            className="flex items-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 google-sans-flex font-bold text-sm h-11 px-5 rounded-full border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </header>

      {/* ── 2. Workspace ── */}
      <AnimatePresence mode="wait">
        {editingArticle ? (
          /* ══════════════════════════════════════
             EDITOR VIEW
             ══════════════════════════════════════ */
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-6"
          >
            {/* Editor top bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-5">
              <button
                onClick={() => setEditingArticle(null)}
                className="flex items-center gap-2 google-sans-flex font-bold text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to articles
              </button>
              <div className="flex items-center gap-3">
                {lastAutosaved && (
                  <span className="stack-sans-text text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a2535] border border-slate-100 dark:border-white/5 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                    Autosaved {lastAutosaved}
                  </span>
                )}

                {/* Sidebar toggle */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs google-sans-flex font-bold transition-all cursor-pointer ${
                    sidebarOpen
                      ? 'bg-accent/15 border-accent/30 text-accent dark:bg-[#10B981]/20 dark:border-[#10B981]/30 dark:text-[#10B981]'
                      : 'bg-white dark:bg-[#1a2535] border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  title="Toggle Settings Sidebar"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Metadata</span>
                </button>

                {/* Split view toggles */}
                <div className="flex items-center bg-slate-100 dark:bg-[#111e2c] p-1 border border-slate-200 dark:border-white/[0.08] rounded-full">
                  {(['write', 'split', 'preview'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditorLayoutMode(mode)}
                      className={`google-sans-flex text-xs px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer capitalize ${
                        editorLayoutMode === mode
                          ? 'bg-accent text-white shadow-sm font-extrabold'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-white/80'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-white google-sans-flex font-bold text-sm rounded-full transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" /> Format Help
                </button>
                <button
                  onClick={() => setEditingArticle(null)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1a2535] google-sans-flex font-bold text-sm rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent/90 text-white disabled:opacity-50 google-sans-flex font-bold text-sm rounded-full transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  {isSaving ? 'Saving…' : <><Save className="w-4 h-4" /> Save Article</>}
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6 w-full">

              {/* ── Metadata panel (Row above) ── */}
              {sidebarOpen && (
                <div className="bg-white dark:bg-[#1a2535] border border-slate-200 dark:border-white/[0.10] p-7 rounded-[1.75rem] shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] w-full space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                    <h2 className="google-sans-flex text-lg font-bold text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                      Article Metadata
                    </h2>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold stack-sans-text">Horizontal Curation Dashboard</span>
                  </div>

                  {/* Section 1: Core Fields (Title, Slug, Status) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    {/* Title */}
                    <div className="md:col-span-6 space-y-1.5">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Title <span className="text-red-400">*</span></label>
                      <input type="text" required value={formTitle} onChange={e => handleTitleChange(e.target.value)}
                        placeholder="e.g. Designing stateful agent workflows"
                        className="w-full google-sans-flex text-base bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Slug */}
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Slug</label>
                      <input type="text" required value={formSlug} onChange={e => setFormSlug(e.target.value)}
                        placeholder="e.g. designing-stateful-agent-workflows"
                        className="w-full stack-sans-text text-sm bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-slate-800 dark:text-white font-medium"
                      />
                    </div>

                    {/* Status toggle */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Release Status</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#111e2c] p-1.5 border border-slate-200 dark:border-white/[0.08] rounded-xl">
                        {(['draft', 'published'] as const).map(s => (
                          <button key={s} type="button" onClick={() => setFormStatus(s)}
                            className={`google-sans-flex text-xs py-2 rounded-lg font-bold transition-all cursor-pointer capitalize ${
                              formStatus === s
                                ? s === 'draft'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                                : 'text-slate-400 dark:text-slate-500 border border-transparent hover:text-slate-700'
                            }`}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Media & Details (Excerpt, Cover Image, Illustration, Feature Checkbox) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    {/* Excerpt */}
                    <div className="md:col-span-5 space-y-1.5">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Excerpt</label>
                      <textarea rows={2} value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)}
                        placeholder="Brief summary…"
                        className="w-full google-sans-flex text-sm bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-slate-800 dark:text-white resize-none"
                      />
                    </div>

                    {/* Cover Image */}
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Cover Image URL</label>
                      <input type="text" value={formCoverImage} onChange={e => setFormCoverImage(e.target.value)}
                        placeholder="https://…"
                        className="w-full stack-sans-text text-sm bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Diagram picker */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Diagram SVG</label>
                      <div className="flex gap-2 items-center">
                        <select value={formIllustration}
                          onChange={e => setFormIllustration(e.target.value as Article['illustrationType'])}
                          className="flex-1 google-sans-flex text-xs bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-3 focus:outline-none focus:border-accent text-slate-800 dark:text-white"
                        >
                          {ILLUSTRATIONS_LIST.map(ill => <option key={ill} value={ill}>{ill}</option>)}
                        </select>
                        <div className="w-14 h-10 rounded-lg border border-slate-200 dark:border-white/[0.08] overflow-hidden bg-slate-50 dark:bg-[#111e2c] shrink-0">
                          <IllustrationThumb type={formIllustration} coverImage={formCoverImage} />
                        </div>
                      </div>
                    </div>

                    {/* Featured */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] px-4 py-3.5 rounded-xl">
                        <input type="checkbox" id="featured-check" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)}
                          className="w-4 h-4 accent-accent border-slate-300 rounded"
                        />
                        <label htmlFor="featured-check" className="google-sans-flex text-xs font-bold text-slate-700 dark:text-white select-none cursor-pointer flex items-center gap-1.5 truncate">
                          <Star className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Feature on home layout
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Categories & Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                    {/* Categories */}
                    <div className="md:col-span-6 space-y-2">
                      <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Categories</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES_LIST.map(cat => {
                          const active = formCategories.includes(cat);
                          return (
                            <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                              className={`stack-sans-text text-[10px] font-semibold tracking-tight px-2.5 py-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                                active
                                  ? 'bg-accent/15 text-accent border-accent/30 font-bold'
                                  : 'bg-slate-50 dark:bg-[#1a2535] text-slate-500 dark:text-white/50 border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
                              }`}
                            >{cat}</button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Key Takeaways */}
                    <div className="md:col-span-6 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                        <label className="stack-sans-text text-[11px] uppercase tracking-wider text-slate-400 font-bold">Key Takeaways</label>
                        <button type="button" onClick={addTakeawayField}
                          className="flex items-center gap-1 google-sans-flex text-xs font-bold text-accent hover:text-accent/80 transition-colors cursor-pointer"
                        ><Plus className="w-3 h-3" /> Add Takeaway</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-36 overflow-y-auto pr-1">
                        {formTakeaways.map((t, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input type="text" value={t} onChange={e => updateTakeaway(i, e.target.value)}
                              placeholder="Core learning point…"
                              className="w-full google-sans-flex text-xs bg-slate-50 dark:bg-[#111e2c] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 focus:outline-none focus:border-accent text-slate-800 dark:text-white"
                            />
                            <button type="button" onClick={() => removeTakeawayField(i)}
                              className="text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                            ><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Editor + Preview split ── */}
              <div className="flex flex-col gap-5 h-[760px] items-stretch relative w-full">
                <div className={`flex flex-col md:grid gap-5 h-full ${
                  editorLayoutMode === 'split' 
                    ? 'md:grid-cols-2' 
                    : 'md:grid-cols-1'
                }`}>
                  {/* Write panel */}
                  {(editorLayoutMode === 'split' || editorLayoutMode === 'write') && (
                    <div className="flex flex-col border border-slate-200 dark:border-white/[0.10] rounded-[2rem] bg-white dark:bg-[#1a2535] overflow-hidden p-6 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] focus-within:border-accent/40 focus-within:shadow-[0_8px_32px_-12px_rgba(16,185,129,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-all duration-300">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-4 shrink-0">
                        <div className="flex items-center gap-4">
                          <span className="stack-sans-text text-[11px] tracking-wider font-bold text-slate-400 uppercase">Editor · Markdown</span>
                          
                          {/* Markdown formatting quick helper toolbar */}
                          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 dark:border-white/5 pl-4">
                            <button type="button" onClick={() => insertMarkdown('**', '**')} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-[#111e2c] rounded transition-all font-bold text-xs" title="Bold">B</button>
                            <button type="button" onClick={() => insertMarkdown('*', '*')} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-[#111e2c] rounded transition-all italic text-xs" title="Italic">I</button>
                            <button type="button" onClick={() => insertMarkdown('### ', '')} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-[#111e2c] rounded transition-all text-[10px] font-bold" title="Heading">H</button>
                            <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-[#111e2c] rounded transition-all" title="Link"><ArrowUpRight className="w-3 h-3" /></button>
                            <button type="button" onClick={() => insertMarkdown('`', '`')} className="h-6 w-9 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-[#111e2c] rounded transition-all text-[10px] font-mono" title="Code">Code</button>
                            <button type="button" onClick={() => insertMarkdown('```javascript\n', '\n```')} className="h-6 w-10 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-[#111e2c] rounded transition-all text-[9px] font-mono" title="Code Block">Block</button>
                          </div>
                        </div>
                        <span className="stack-sans-text text-[11px] text-slate-400">{wordCount.toLocaleString()} w · {charCount.toLocaleString()} c</span>
                      </div>
                      <textarea required value={formContent} onChange={e => setFormContent(e.target.value)}
                        placeholder="# Write your article here…"
                        className="w-full flex-grow text-sm bg-transparent border-0 p-1 resize-none focus:outline-none text-slate-800 dark:text-white font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Preview panel */}
                  {(editorLayoutMode === 'split' || editorLayoutMode === 'preview') && (
                    <div className="flex flex-col border border-slate-200 dark:border-white/[0.10] rounded-[2rem] bg-slate-50 dark:bg-[#131f2e] overflow-hidden p-6 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-all duration-300">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-3 mb-4 shrink-0">
                        <Eye className="w-4 h-4 text-accent" />
                        <span className="stack-sans-text text-[11px] tracking-wider font-bold text-slate-400 uppercase">Live Preview</span>
                      </div>
                      <div className="w-full flex-grow overflow-y-auto pr-1 select-text">
                        {formContent
                          ? <div className="max-w-none text-left">{renderMarkdown(formContent)}</div>
                          : <p className="google-sans-flex text-sm text-slate-400 italic">Nothing to preview yet.</p>
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Format guide drawer */}
                <AnimatePresence>
                  {showHelp && (
                    <motion.div
                      key="help"
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'tween', duration: 0.28 }}
                      className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-white/10 shadow-2xl rounded-r-[2rem] p-6 z-30 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                        <span className="google-sans-flex font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                          <FileText className="w-5 h-5 text-accent" /> Format Guide
                        </span>
                        <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-5 text-slate-600 dark:text-white/70 leading-relaxed">
                        {[
                          { label: 'Headers', code: '# Title (H1)\n## Heading (H2)\n### Subheading (H3)' },
                          { label: 'Emphasis', code: '**bold** | *italic* | `inline code`' },
                          { label: 'Blockquote', code: '> This is a blockquote\n> with an accent border.' },
                          { label: 'Lists', code: '- Item one\n- Item two' },
                          { label: 'Code Block', code: '```javascript\nconst x = 1;\n```' },
                          { label: 'Link', code: '[text](https://url.com)' },
                        ].map(({ label, code }) => (
                          <div key={label}>
                            <p className="google-sans-flex font-bold text-slate-900 dark:text-white mb-2 text-sm">{label}</p>
                            <pre className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl stack-sans-text text-[11px] whitespace-pre-wrap text-slate-600 dark:text-white/60">{code}</pre>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ══════════════════════════════════════
             CURATOR'S CANVAS — CARD FEED
             ══════════════════════════════════════ */
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Search + New Article */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-white dark:bg-[#1a2535] border border-slate-200 dark:border-white/[0.10] p-4 rounded-2xl shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)]">
              <div className="relative flex-grow max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search articles by title, tag, or slug…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full google-sans-flex bg-slate-50 dark:bg-[#111e2c] border border-slate-200/80 dark:border-white/[0.08] rounded-full pl-12 pr-5 py-3 text-sm focus:outline-none focus:border-accent placeholder-slate-400 text-slate-800 dark:text-white"
                />
              </div>
              <button
                onClick={startNewArticle}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white google-sans-flex font-bold text-sm h-12 px-7 rounded-full transition-all active:scale-95 shadow-md shadow-accent/20 cursor-pointer shrink-0"
              >
                <Plus className="w-5 h-5" /> New Article
              </button>
            </div>

            {/* Column header labels */}
            <div className="hidden md:grid grid-cols-[140px_1fr_220px_130px] gap-6 px-5">
              <span className="stack-sans-text text-[10px] uppercase tracking-widest text-slate-400 font-bold">Cover</span>
              <span className="stack-sans-text text-[10px] uppercase tracking-widest text-slate-400 font-bold">Article</span>
              <span className="stack-sans-text text-[10px] uppercase tracking-widest text-slate-400 font-bold hidden lg:block">Categories</span>
              <span className="stack-sans-text text-[10px] uppercase tracking-widest text-slate-400 font-bold">Actions</span>
            </div>

            {/* Card feed */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredArticles.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 gap-5"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-9 h-9 text-slate-300 dark:text-white/20" />
                    </div>
                    <div className="text-center">
                      <p className="google-sans-flex font-bold text-slate-500 dark:text-white/40 text-lg">No articles found</p>
                      <p className="google-sans-flex text-sm text-slate-400 dark:text-white/25 mt-1">
                        {searchQuery ? 'Try a different search term.' : 'Create your first article to get started.'}
                      </p>
                    </div>
                    {!searchQuery && (
                      <button onClick={startNewArticle}
                        className="flex items-center gap-2 bg-accent/10 hover:bg-accent/15 text-accent google-sans-flex font-bold text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Create first article
                      </button>
                    )}
                  </motion.div>
                ) : (
                  filteredArticles.map((post, i) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      index={i}
                      onEdit={startEditArticle}
                      onDelete={handleDelete}
                      isDeletingId={isDeletingId}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer count */}
            {filteredArticles.length > 0 && (
              <p className="text-center stack-sans-text text-[11px] text-slate-400 dark:text-white/25 pt-2 pb-6">
                {filteredArticles.length} of {articles.length} articles
                {searchQuery && ' matching your search'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
