'use client';

import { Component, useState, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import {
  Plus, Search, ArrowLeft, LogOut, Sparkles, Clock, Eye, Download, Save, X,
  HelpCircle, FileText, Info, RefreshCw, Star, ArrowUpRight, Pen, Trash2,
  Settings2, Maximize2, Upload, Loader2, ImagePlus, Table2,
} from 'lucide-react';
import { Article } from '@/lib/blog-service';
import { avatarForSession, type UserSession } from '@/lib/auth';
import { renderMarkdown } from '@/lib/markdown';
import Link from 'next/link';
import { CATEGORIES as CATEGORIES_LIST } from '@/lib/categories';
import { renderIllustration } from '@/components/render-illustration';
import { XStudioClient } from './x-studio-client';
import { siteConfig } from '@/lib/site-config';

/** Keep blog CMS usable if X To-Do throws — avoid full-page error boundary. */
class XStudioErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[x-studio]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="atelier-card-lg py-16 px-8 flex flex-col items-center gap-4 text-center max-w-lg mx-auto">
          <p className="font-headline font-bold text-xl text-[var(--atelier-ink)]">
            X To-Do hit a glitch
          </p>
          <p className="text-sm text-[var(--atelier-muted)] leading-relaxed">
            {this.state.error.message || 'Unexpected render error'}
          </p>
          <button
            type="button"
            className="atelier-btn atelier-btn-gold"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ILLUSTRATIONS_LIST = [
  'diagram1', 'diagram2', 'diagram3', 'diagram4',
  'diagram5', 'diagram6', 'diagram7', 'diagram8',
] as const;

interface EditorialClientProps {
  initialArticles: Article[];
  user: UserSession;
  /** From server searchParams — never sync URL during render/mount via history API */
  initialWorkspace?: 'blog' | 'x';
}

function IllustrationThumb({
  type,
  coverImage,
  onPreview,
}: {
  type: string;
  coverImage?: string;
  onPreview?: (type: string, url?: string) => void;
}) {
  const isCover = type === 'cover' && coverImage;
  return (
    <div
      onClick={(e) => {
        if (onPreview) {
          e.stopPropagation();
          onPreview(type, coverImage);
        }
      }}
      className={`w-full h-full relative group ${onPreview ? 'cursor-pointer' : ''} overflow-hidden`}
      title={onPreview ? 'Preview' : undefined}
    >
      {isCover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full origin-center opacity-90 transition-transform duration-500 group-hover:scale-105">
          {renderIllustration(type === 'cover' ? 'diagram1' : type, false)}
        </div>
      )}
      {onPreview && (
        <div className="absolute inset-0 bg-black/30 dark:bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {/* Fixed light chip + dark icon so contrast stays clear in both themes */}
          <span className="w-9 h-9 rounded-full bg-white shadow-lg shadow-black/25 flex items-center justify-center ring-1 ring-black/5">
            <Maximize2 className="w-4 h-4 text-neutral-900" strokeWidth={2.25} />
          </span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'draft' | 'published' | undefined }) {
  if (status === 'draft') {
    return (
      <span className="atelier-chip !border-amber-500/25 !bg-amber-500/10 !text-amber-800 dark:!text-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Draft
      </span>
    );
  }
  return (
    <span className="atelier-chip !border-emerald-500/25 !bg-emerald-500/10 !text-emerald-800 dark:!text-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Live
    </span>
  );
}

function ArticleCard({
  post,
  index,
  onEdit,
  onDelete,
  isDeletingId,
  onPreview,
}: {
  post: Article;
  index: number;
  onEdit: (a: Article) => void;
  onDelete: (id: number) => void;
  isDeletingId: number | null;
  onPreview: (type: string, url?: string) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.28), ease: [0.16, 1, 0.3, 1] }}
      className="group atelier-card p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center hover:shadow-[var(--atelier-shadow)] transition-shadow duration-300"
    >
      <div className="relative shrink-0 w-full sm:w-[148px] h-[110px] sm:h-[96px] rounded-[1.25rem] overflow-hidden border border-[var(--atelier-line)] bg-[var(--atelier-paper)] shadow-inner">
        <IllustrationThumb type={post.illustrationType} coverImage={post.coverImage} onPreview={onPreview} />
      </div>

      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {post.featured && (
            <span className="atelier-chip !border-[var(--atelier-gold)]/30 !bg-[var(--atelier-gold-soft)] !text-[var(--atelier-gold)]">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          <StatusBadge status={post.status} />
        </div>
        <h3 className="font-headline text-xl sm:text-[1.35rem] font-bold tracking-tight text-[var(--atelier-ink)] leading-snug line-clamp-2 group-hover:text-[var(--atelier-gold)] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[0.9375rem] text-[var(--atelier-muted)] line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-[var(--atelier-faint)] font-medium tracking-wide">
          <span className="font-mono text-[0.65rem] opacity-80">/{post.slug}</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--atelier-gold)]" /> {post.readTime}
          </span>
          <span className="opacity-40">·</span>
          <span>{post.date}</span>
        </div>
      </div>

      <div className="hidden lg:flex flex-wrap gap-1.5 max-w-[200px] shrink-0">
        {post.categories.slice(0, 3).map((c) => (
          <span key={c} className="atelier-chip">
            {c}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button type="button" onClick={() => onEdit(post)} className="atelier-icon-btn" title="Edit" aria-label="Edit">
          <Pen className="w-4 h-4" />
        </button>
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="atelier-icon-btn"
          title="View"
          aria-label="View"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(post.id)}
          disabled={isDeletingId === post.id}
          className="atelier-icon-btn hover:!text-red-500 hover:!border-red-400/30 disabled:opacity-40"
          title="Delete"
          aria-label="Delete"
        >
          {isDeletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </motion.article>
  );
}

const WORKSPACE_KEY = 'editorial_workspace';

export function EditorialClient({
  initialArticles,
  user,
  initialWorkspace = 'blog',
}: EditorialClientProps) {
  const workspace = initialWorkspace;
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [hasBackupDraft, setHasBackupDraft] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorLayoutMode, setEditorLayoutMode] = useState<'write' | 'split' | 'preview'>('split');

  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formIllustration, setFormIllustration] = useState<Article['illustrationType']>('diagram1');
  const [formTakeaways, setFormTakeaways] = useState<string[]>(['']);
  const [formContent, setFormContent] = useState('');
  const formReadTime = `${Math.ceil(formContent.trim().split(/\s+/).filter(Boolean).length / 200) || 1} min read`;
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);
  const [prevEditingArticle, setPrevEditingArticle] = useState(editingArticle);
  if (editingArticle !== prevEditingArticle) {
    setPrevEditingArticle(editingArticle);
    setLastAutosaved(null);
  }

  const [customTagInput, setCustomTagInput] = useState('');
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: string; url?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [autoGenerateCoverImage, setAutoGenerateCoverImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);

  const getEditor = () =>
    document.querySelector('textarea[data-atelier-editor]') as HTMLTextAreaElement | null;

  const insertMarkdown = (before: string, after: string) => {
    const textarea = getEditor();
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    setFormContent(text.substring(0, start) + before + selected + after + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  /** Insert raw text at the caret (used for images, table templates). */
  const insertAtCursor = (snippet: string, selectPlaceholder?: string) => {
    const textarea = getEditor();
    if (!textarea) {
      setFormContent((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const next = text.substring(0, start) + snippet + text.substring(end);
    setFormContent(next);
    setTimeout(() => {
      textarea.focus();
      if (selectPlaceholder) {
        const idx = snippet.indexOf(selectPlaceholder);
        if (idx >= 0) {
          const a = start + idx;
          textarea.setSelectionRange(a, a + selectPlaceholder.length);
          return;
        }
      }
      const pos = start + snippet.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertTableTemplate = () => {
    insertAtCursor(
      '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n\n',
      'Column 1'
    );
  };

  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);
  const [editorDragOver, setEditorDragOver] = useState(false);

  const uploadInlineImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please drop or pick an image file (JPEG, PNG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', formSlug || 'inline');
    setIsUploadingInlineImage(true);
    try {
      const res = await fetch('/api/blog/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'image';
      insertAtCursor(`\n![${alt}](${data.url})\n\n`, alt);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setIsUploadingInlineImage(false);
    }
  };

  const triggerInlineImageUpload = () => {
    (document.getElementById('inline-content-image-upload') as HTMLInputElement | null)?.click();
  };

  const handleInlineImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await uploadInlineImageFile(file);
  };

  const handleEditorDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditorDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadInlineImageFile(file);
  };

  const handleEditorPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await uploadInlineImageFile(file);
        return;
      }
    }
  };

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Remember preference only — do NOT touch history/router on mount (causes App Router errors)
  useEffect(() => {
    try {
      localStorage.setItem(WORKSPACE_KEY, workspace);
    } catch {
      /* ignore */
    }
  }, [workspace]);

  const triggerImageUpload = () => {
    (document.getElementById('local-cover-upload') as HTMLInputElement | null)?.click();
  };

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', formSlug || 'cover');
    setIsUploadingImage(true);
    try {
      const res = await fetch('/api/blog/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image.');
      setFormCoverImage(data.url);
      setFormIllustration('cover');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const runGrokCoverGeneration = async (prompt: string, slug?: string) => {
    if (!prompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const r = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug || formSlug || 'cover', prompt }),
      });
      const imgData = await r.json();
      if (imgData.success && imgData.url) {
        setFormCoverImage(imgData.url);
        setFormIllustration('cover');
      } else {
        throw new Error(imgData.error || 'Grok did not return an image URL.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Cover generation failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAiFill = async () => {
    if (!formContent.trim()) {
      alert('Write some content first so AI can analyze it.');
      return;
    }
    setIsAiFilling(true);
    setGeneratedImagePrompt('');
    setPromptCopied(false);
    try {
      const res = await fetch('/api/ai/fill', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-fill metadata.');
      const meta = data.metadata;
      if (meta.title) setFormTitle(meta.title);
      if (meta.slug) setFormSlug(meta.slug);
      if (meta.excerpt) setFormExcerpt(meta.excerpt);
      if (Array.isArray(meta.categories)) setFormCategories(meta.categories);
      if (Array.isArray(meta.takeaways)) setFormTakeaways(meta.takeaways.filter(Boolean));
      if (meta.illustrationType) setFormIllustration(meta.illustrationType);
      if (data.imagePrompt) {
        setGeneratedImagePrompt(data.imagePrompt);
        if (autoGenerateCoverImage) {
          await runGrokCoverGeneration(data.imagePrompt, meta.slug || formSlug);
        }
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'AI fill failed');
    } finally {
      setIsAiFilling(false);
    }
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!formCategories.includes(trimmed)) setFormCategories([...formCategories, trimmed]);
    setCustomTagInput('');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('edudojo_draft_autosave')) {
      setTimeout(() => setHasBackupDraft(true), 0);
    }
  }, []);

  useEffect(() => {
    if (!editingArticle) return;
    const interval = setInterval(() => {
      localStorage.setItem(
        'edudojo_draft_autosave',
        JSON.stringify({
          title: formTitle,
          slug: formSlug,
          excerpt: formExcerpt,
          categories: formCategories,
          readTime: formReadTime,
          illustrationType: formIllustration,
          takeaways: formTakeaways,
          content: formContent,
          featured: formFeatured,
          status: formStatus,
          coverImage: formCoverImage,
          editingId: editingArticle.id,
        })
      );
      setHasBackupDraft(true);
      setLastAutosaved(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [
    formTitle, formSlug, formExcerpt, formCategories, formReadTime, formIllustration,
    formTakeaways, formContent, formFeatured, formStatus, formCoverImage, editingArticle,
  ]);

  useEffect(() => {
    if (!editingArticle) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [editingArticle]);

  const handleRestoreDraft = () => {
    const raw = localStorage.getItem('edudojo_draft_autosave');
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      setFormTitle(d.title || '');
      setFormSlug(d.slug || '');
      setFormExcerpt(d.excerpt || '');
      setFormCategories(d.categories || ['Engineering']);
      setFormIllustration(d.illustrationType || 'diagram1');
      setFormTakeaways(d.takeaways?.length > 0 ? d.takeaways : ['']);
      setFormContent(d.content || '');
      setFormFeatured(!!d.featured);
      setFormStatus(d.status || 'draft');
      setFormCoverImage(d.coverImage || '');
      setEditingArticle({ id: d.editingId });
      setHasBackupDraft(false);
    } catch { /* ignore */ }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('edudojo_draft_autosave');
    setHasBackupDraft(false);
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startNewArticle = () => {
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormCategories(['Engineering']);
    setFormIllustration('diagram1');
    setFormTakeaways(['']);
    setFormContent('');
    setFormFeatured(false);
    setFormStatus('draft');
    setFormCoverImage('');
    setEditingArticle({ id: undefined });
    setGeneratedImagePrompt('');
  };

  const startEditArticle = (article: Article) => {
    setFormTitle(article.title);
    setFormSlug(article.slug);
    setFormExcerpt(article.excerpt);
    setFormCategories(article.categories);
    setFormIllustration(article.illustrationType);
    setFormTakeaways(article.takeaways.length > 0 ? article.takeaways : ['']);
    setFormContent(article.content);
    setFormFeatured(!!article.featured);
    setFormStatus(article.status || 'published');
    setFormCoverImage(article.coverImage || '');
    setEditingArticle(article);
    setGeneratedImagePrompt('');
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingArticle?.id) {
      setFormSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 120)
      );
    }
  };

  const updateTakeaway = (i: number, val: string) => {
    const n = [...formTakeaways];
    n[i] = val;
    setFormTakeaways(n);
  };
  const addTakeawayField = () => setFormTakeaways([...formTakeaways, '']);
  const removeTakeawayField = (i: number) => {
    const n = formTakeaways.filter((_, j) => j !== i);
    setFormTakeaways(n.length === 0 ? [''] : n);
  };
  const toggleCategory = (cat: string) =>
    setFormCategories(
      formCategories.includes(cat) ? formCategories.filter((c) => c !== cat) : [...formCategories, cat]
    );

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSaving) return;
    if (!formTitle || !formSlug || !formContent) {
      alert('Please fill Title, Slug, and Content.');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Partial<Article> = {
        id: editingArticle?.id,
        title: formTitle,
        slug: formSlug,
        excerpt: formExcerpt,
        categories: formCategories.length > 0 ? formCategories : ['Engineering'],
        readTime: formReadTime,
        illustrationType: formIllustration,
        takeaways: formTakeaways.filter((t) => t.trim() !== ''),
        content: formContent,
        featured: formFeatured,
        status: formStatus,
        coverImage: formCoverImage,
        author: siteConfig.name,
        authorRole: siteConfig.authorRole,
        authorAvatar: siteConfig.authorAvatar,
      };
      const res = await fetch('/api/blog', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.reason || 'Save failed');
      }
      localStorage.removeItem('edudojo_draft_autosave');
      setHasBackupDraft(false);
      const refresh = await fetch('/api/blog?includeAll=true', { credentials: 'include' });
      if (refresh.ok) setArticles(await refresh.json());
      setEditingArticle(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this article?')) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/blog?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.reason || 'Delete failed');
      }
      const refresh = await fetch('/api/blog?includeAll=true', { credentials: 'include' });
      if (refresh.ok) setArticles(await refresh.json());
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeletingId(null);
    }
  };

  const exportJson = () => {
    const a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(articles, null, 2));
    a.download = 'articles.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const wordCount = formContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = formContent.length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const featuredCount = articles.filter((a) => a.featured).length;

  return (
    <div
      className={`px-4 sm:px-6 md:px-10 mx-auto w-full transition-all duration-300 ${
        editingArticle
          ? 'max-w-[96%] 2xl:max-w-[1700px]'
          : workspace === 'x'
            ? 'max-w-5xl'
            : 'max-w-6xl'
      }`}
    >
      {/* Draft recovery */}
      <AnimatePresence>
        {hasBackupDraft && !editingArticle && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-8 atelier-card-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[var(--atelier-gold)]/25"
          >
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-[var(--atelier-gold-soft)] flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-[var(--atelier-gold)]" />
              </div>
              <div>
                <p className="font-headline text-lg font-bold text-[var(--atelier-ink)]">Unsaved draft found</p>
                <p className="text-sm text-[var(--atelier-muted)] mt-1 leading-relaxed">
                  Resume where you left off on this device, or discard the local snapshot.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={handleRestoreDraft} className="atelier-btn atelier-btn-gold">
                <RefreshCw className="w-4 h-4" /> Restore
              </button>
              <button type="button" onClick={handleDiscardDraft} className="atelier-btn atelier-btn-ghost">
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero — full for blog CMS; compact for X To-Do so the queue has room */}
      <header className={workspace === 'x' ? 'mb-6 sm:mb-8' : 'mb-10 sm:mb-12'}>
        {workspace === 'x' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div className="space-y-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--atelier-gold)]">
                Private atelier
              </p>
              <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
                X To-Do
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-card)] px-3 py-1.5 pr-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarForSession(user)}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--atelier-gold)]/25"
                />
                <span className="font-headline text-xs font-bold text-[var(--atelier-ink)] truncate max-w-[8rem]">
                  {user.name}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="atelier-card-lg p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div
              className="absolute -right-16 -top-20 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--atelier-gold-soft), transparent 70%)' }}
            />
            <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--atelier-gold)]">
                  Private atelier · Google OAuth
                </p>
                <h1 className="font-headline text-4xl sm:text-5xl md:text-[3.25rem] font-extrabold tracking-[-0.03em] text-[var(--atelier-ink)] leading-[1.05]">
                  Editorial
                  <span className="block text-[var(--atelier-muted)] font-semibold text-[0.85em] mt-1 tracking-tight">
                    workspace
                  </span>
                </h1>
                <p className="text-[var(--atelier-muted)] text-base sm:text-lg leading-relaxed max-w-lg">
                  Shape essays with quiet control — AI for scaffolding, you for the voice.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="atelier-chip !py-1.5 !px-3.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {publishedCount} live
                  </span>
                  <span className="atelier-chip !py-1.5 !px-3.5">{draftCount} drafts</span>
                  {featuredCount > 0 && (
                    <span className="atelier-chip !py-1.5 !px-3.5 !text-[var(--atelier-gold)]">
                      <Star className="w-3 h-3" /> {featuredCount} featured
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-3 rounded-[1.35rem] border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/60 px-3.5 py-2.5 pr-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarForSession(user)}
                    alt=""
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[var(--atelier-gold)]/30"
                  />
                  <div className="min-w-0 leading-tight">
                    <p className="font-headline font-bold text-sm text-[var(--atelier-ink)] truncate max-w-[9rem] sm:max-w-none">
                      {user.name}
                    </p>
                    <p className="text-[0.65rem] text-[var(--atelier-faint)] truncate max-w-[10rem] sm:max-w-[14rem]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={exportJson} className="atelier-btn atelier-btn-ghost">
                  <Download className="w-4 h-4 text-[var(--atelier-gold)]" />
                  <span className="hidden sm:inline">Backup</span>
                </button>
                <Link
                  href="/api/auth/logout"
                  className="atelier-btn atelier-btn-ghost !text-red-600 dark:!text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {workspace === 'x' && !editingArticle ? (
        <XStudioErrorBoundary>
          <XStudioClient />
        </XStudioErrorBoundary>
      ) : (
      <AnimatePresence mode="wait">
        {editingArticle ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Sticky command bar */}
            <div className="sticky top-24 z-30">
              <div className="atelier-card-lg p-3 sm:p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3 backdrop-blur-xl bg-[color-mix(in_srgb,var(--atelier-card)_92%,transparent)]">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)] transition-colors px-2 py-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Library
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  {lastAutosaved && (
                    <span className="atelier-chip !text-[0.65rem]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {lastAutosaved}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`atelier-btn h-10 text-xs ${
                      sidebarOpen ? 'atelier-btn-gold' : 'atelier-btn-ghost'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Meta
                  </button>
                  <div className="flex p-1 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50">
                    {(['write', 'split', 'preview'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setEditorLayoutMode(mode)}
                        className={`px-3.5 py-1.5 rounded-full text-[0.7rem] font-bold capitalize transition-all ${
                          editorLayoutMode === mode
                            ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)] shadow-md'
                            : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowHelp(!showHelp)} className="atelier-btn atelier-btn-ghost h-10 text-xs">
                    <HelpCircle className="w-4 h-4" /> Format
                  </button>
                  <button type="button" onClick={() => setEditingArticle(null)} className="atelier-btn atelier-btn-ghost h-10 text-xs">
                    Cancel
                  </button>
                  <button type="button" onClick={() => handleSave()} disabled={isSaving} className="atelier-btn atelier-btn-primary h-10 disabled:opacity-50">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {sidebarOpen && (
                <div className="atelier-card-lg p-6 sm:p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--atelier-line)]">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--atelier-gold)] mb-1">
                        Curation
                      </p>
                      <h2 className="font-headline text-2xl font-bold text-[var(--atelier-ink)] tracking-tight">
                        Article metadata
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAiFill}
                        disabled={isAiFilling || isGeneratingImage}
                        className="atelier-btn atelier-btn-violet disabled:opacity-50"
                        title={
                          autoGenerateCoverImage
                            ? 'Metadata + prompt + Grok image'
                            : 'Metadata + copyable cover prompt only'
                        }
                      >
                        <Sparkles className={`w-4 h-4 ${isAiFilling ? 'animate-spin' : ''}`} />
                        {isAiFilling ? 'Curating…' : 'AI Fill'}
                      </button>
                      <label className="atelier-chip cursor-pointer select-none !py-2 !px-3.5 hover:border-[var(--atelier-violet)]/40">
                        <input
                          type="checkbox"
                          checked={autoGenerateCoverImage}
                          onChange={(e) => setAutoGenerateCoverImage(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[var(--atelier-violet)] rounded"
                        />
                        + Grok image
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-6">
                      <label className="atelier-label">Title *</label>
                      <input
                        className="atelier-input font-headline font-semibold text-base !h-12"
                        value={formTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="A title with quiet authority"
                        required
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="atelier-label">Slug</label>
                      <input
                        className="atelier-input font-mono text-xs !h-12"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="atelier-label">Status</label>
                      <div className="flex h-12 p-1 rounded-[1rem] border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50">
                        {(['draft', 'published'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormStatus(s)}
                            className={`flex-1 rounded-[0.75rem] text-[0.7rem] font-bold capitalize transition-all ${
                              formStatus === s
                                ? s === 'draft'
                                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                                  : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                                : 'text-[var(--atelier-faint)]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-4">
                      <label className="atelier-label">Excerpt</label>
                      <input
                        className="atelier-input"
                        value={formExcerpt}
                        onChange={(e) => setFormExcerpt(e.target.value)}
                        placeholder="One elegant sentence…"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="atelier-label">
                        Cover URL
                        {isGeneratingImage && (
                          <span className="ml-2 normal-case tracking-normal text-[var(--atelier-violet)]">
                            Grok rendering…
                          </span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="atelier-input flex-1 min-w-0"
                          value={formCoverImage}
                          onChange={(e) => setFormCoverImage(e.target.value)}
                          placeholder="https://… or upload"
                        />
                        <button
                          type="button"
                          onClick={triggerImageUpload}
                          disabled={isUploadingImage}
                          className="atelier-icon-btn !w-12 !h-12 !rounded-[1rem] shrink-0"
                          title="Upload"
                        >
                          {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </button>
                        <input id="local-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleLocalImageUpload} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="atelier-label">Diagram</label>
                      <div className="flex gap-2">
                        <select
                          value={formIllustration}
                          onChange={(e) => setFormIllustration(e.target.value as Article['illustrationType'])}
                          className="atelier-input flex-1 !px-3 text-xs"
                        >
                          {ILLUSTRATIONS_LIST.map((ill) => (
                            <option key={ill} value={ill}>
                              {ill}
                            </option>
                          ))}
                          <option value="cover">cover</option>
                        </select>
                        <div className="w-12 h-12 rounded-[1rem] border border-[var(--atelier-line)] overflow-hidden shrink-0 bg-[var(--atelier-paper)]">
                          <IllustrationThumb
                            type={formIllustration}
                            coverImage={formCoverImage}
                            onPreview={(type, url) => setPreviewItem({ type, url })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="atelier-label">Feature</label>
                      <label className="flex items-center gap-2.5 h-12 px-3.5 rounded-[1rem] border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formFeatured}
                          onChange={(e) => setFormFeatured(e.target.checked)}
                          className="w-4 h-4 accent-[var(--atelier-gold)] rounded"
                        />
                        <Star className="w-3.5 h-3.5 text-[var(--atelier-gold)]" />
                        <span className="text-xs font-bold text-[var(--atelier-ink)]">Home</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="atelier-label">Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES_LIST.map((cat) => {
                          const active = formCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={`atelier-chip transition-all ${
                                active
                                  ? '!bg-[var(--atelier-gold-soft)] !border-[var(--atelier-gold)]/40 !text-[var(--atelier-ink)]'
                                  : 'hover:border-[var(--atelier-gold)]/30'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                        {formCategories
                          .filter((cat) => !(CATEGORIES_LIST as readonly string[]).includes(cat))
                          .map((cat) => (
                            <span key={cat} className="atelier-chip !bg-[var(--atelier-gold-soft)] !border-[var(--atelier-gold)]/30">
                              {cat}
                              <button type="button" onClick={() => toggleCategory(cat)} className="opacity-60 hover:opacity-100">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        <div className="flex gap-1.5 items-center">
                          <input
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomTag();
                              }
                            }}
                            placeholder="Custom…"
                            className="atelier-input !h-8 !rounded-full !text-xs w-28 !px-3"
                          />
                          <button type="button" onClick={() => handleAddCustomTag()} className="atelier-icon-btn !w-8 !h-8 !rounded-full">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="atelier-label !mb-0">Key takeaways</label>
                        <button type="button" onClick={addTakeawayField} className="text-xs font-bold text-[var(--atelier-gold)] inline-flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {formTakeaways.map((t, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              className="atelier-input !h-10 text-sm"
                              value={t}
                              onChange={(e) => updateTakeaway(i, e.target.value)}
                              placeholder="A crisp learning point…"
                            />
                            <button type="button" onClick={() => removeTakeawayField(i)} className="atelier-icon-btn !w-10 !h-10 shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {generatedImagePrompt && (
                    <div className="rounded-[1.5rem] border border-[var(--atelier-violet)]/20 bg-[color-mix(in_srgb,var(--atelier-violet)_6%,var(--atelier-card))] p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--atelier-violet)] mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Cover prompt
                          </p>
                          <p className="text-sm text-[var(--atelier-muted)]">
                            Copy for free tools — or generate with Grok when you choose.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(generatedImagePrompt);
                                setPromptCopied(true);
                                setTimeout(() => setPromptCopied(false), 2000);
                              } catch {
                                alert('Could not copy');
                              }
                            }}
                            className="atelier-btn atelier-btn-ghost h-10 text-xs"
                          >
                            {promptCopied ? 'Copied' : 'Copy prompt'}
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingImage || isAiFilling}
                            onClick={() => runGrokCoverGeneration(generatedImagePrompt, formSlug)}
                            className="atelier-btn atelier-btn-violet h-10 text-xs disabled:opacity-50"
                          >
                            {isGeneratingImage ? 'Grok…' : 'Generate with Grok'}
                          </button>
                        </div>
                      </div>
                      <p className="font-mono text-xs text-[var(--atelier-muted)] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto select-all">
                        {generatedImagePrompt}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Editor canvas */}
              <div className="relative">
                <div
                  className={`grid gap-5 min-h-[520px] ${
                    editorLayoutMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {(editorLayoutMode === 'split' || editorLayoutMode === 'write') && (
                    <div
                      className={`atelier-card-lg relative flex min-h-[360px] flex-col p-5 transition-shadow focus-within:ring-2 focus-within:ring-[var(--atelier-gold)]/25 sm:min-h-[480px] sm:p-6 ${
                        editorDragOver ? 'ring-2 ring-[var(--atelier-gold)]/40 bg-[var(--atelier-gold-soft)]/20' : ''
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.types.includes('Files')) setEditorDragOver(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (e.currentTarget === e.target) setEditorDragOver(false);
                      }}
                      onDrop={(e) => void handleEditorDrop(e)}
                    >
                      <input
                        id="inline-content-image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => void handleInlineImageInput(e)}
                      />
                      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--atelier-line)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--atelier-faint)]">
                            Write
                          </span>
                          <div className="flex flex-wrap items-center gap-0.5 pl-3 border-l border-[var(--atelier-line)]">
                            <button type="button" onClick={() => insertMarkdown('**', '**')} className="w-8 h-8 rounded-xl text-xs font-bold text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)] hover:text-[var(--atelier-ink)]" title="Bold">B</button>
                            <button type="button" onClick={() => insertMarkdown('*', '*')} className="w-8 h-8 rounded-xl text-xs italic text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]" title="Italic">I</button>
                            <button type="button" onClick={() => insertMarkdown('### ', '')} className="w-8 h-8 rounded-xl text-[0.65rem] font-bold text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]" title="Heading">H</button>
                            <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="w-8 h-8 rounded-xl text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)] flex items-center justify-center" title="Link"><ArrowUpRight className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => insertMarkdown('`', '`')} className="px-2 h-8 rounded-xl text-[0.65rem] font-mono text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]" title="Code">code</button>
                            <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className="px-2 h-8 rounded-xl text-[0.6rem] font-mono text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]" title="Block">{'{}'}</button>
                            <button
                              type="button"
                              onClick={insertTableTemplate}
                              className="w-8 h-8 rounded-xl text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)] flex items-center justify-center"
                              title="Insert table"
                            >
                              <Table2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={triggerInlineImageUpload}
                              disabled={isUploadingInlineImage}
                              className="w-8 h-8 rounded-xl text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)] flex items-center justify-center disabled:opacity-40"
                              title="Insert image"
                            >
                              {isUploadingInlineImage ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ImagePlus className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <span className="text-[0.65rem] tabular-nums text-[var(--atelier-faint)] font-medium shrink-0">
                          {wordCount.toLocaleString()} w · {charCount.toLocaleString()} c · {formReadTime}
                        </span>
                      </div>
                      {editorDragOver && (
                        <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[var(--atelier-gold)]/50 bg-[var(--atelier-card)]/80 backdrop-blur-sm">
                          <p className="font-headline text-sm font-bold text-[var(--atelier-gold)] flex items-center gap-2">
                            <ImagePlus className="w-5 h-5" /> Drop image to insert
                          </p>
                        </div>
                      )}
                      <textarea
                        data-atelier-editor
                        required
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        onPaste={(e) => void handleEditorPaste(e)}
                        placeholder="# Begin the piece…&#10;&#10;Tip: drag & drop or paste an image, or use the image button in the toolbar."
                        className="min-h-[260px] w-full flex-grow resize-none border-0 bg-transparent font-mono text-sm leading-relaxed text-[var(--atelier-ink)] placeholder:text-[var(--atelier-faint)] focus:outline-none sm:min-h-[360px]"
                      />
                      <p className="pt-3 text-[0.65rem] text-[var(--atelier-faint)]">
                        Images: toolbar · drag & drop · paste from clipboard. Tables: toolbar inserts a GFM template.
                      </p>
                    </div>
                  )}

                  {(editorLayoutMode === 'split' || editorLayoutMode === 'preview') && (
                    <div className="atelier-card-lg flex min-h-[360px] flex-col bg-[color-mix(in_srgb,var(--atelier-paper)_55%,var(--atelier-card))] p-5 sm:min-h-[480px] sm:p-6">
                      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[var(--atelier-line)]">
                        <Eye className="w-4 h-4 text-[var(--atelier-gold)]" />
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--atelier-faint)]">
                          Preview
                        </span>
                      </div>
                      <div className="flex-grow overflow-y-auto">
                        {formContent ? (
                          <div className="text-left">{renderMarkdown(formContent)}</div>
                        ) : (
                          <p className="text-sm text-[var(--atelier-faint)] italic">The page is blank — write to see light.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showHelp && (
                    <motion.div
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={{ type: 'tween', duration: 0.3 }}
                      className="absolute right-0 top-0 bottom-0 w-[min(100%,20rem)] atelier-card-lg p-6 z-30 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-headline font-bold flex items-center gap-2 text-[var(--atelier-ink)]">
                          <FileText className="w-5 h-5 text-[var(--atelier-gold)]" /> Format
                        </span>
                        <button type="button" onClick={() => setShowHelp(false)} className="atelier-icon-btn !w-9 !h-9">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-5 text-sm text-[var(--atelier-muted)]">
                        {[
                          { label: 'Headers', code: '# H1\n## H2\n### H3' },
                          { label: 'Emphasis', code: '**bold** *italic* `code`' },
                          { label: 'Quote', code: '> blockquote' },
                          { label: 'List', code: '- one\n- two' },
                          { label: 'Code', code: '```\ncode\n```' },
                          { label: 'Link', code: '[text](https://…)' },
                          { label: 'Image', code: '![alt text](/covers/…)\nor use the image button / drag & drop' },
                          {
                            label: 'Table',
                            code: '| A | B |\n| --- | --- |\n| 1 | 2 |',
                          },
                        ].map(({ label, code }) => (
                          <div key={label}>
                            <p className="font-headline font-bold text-[var(--atelier-ink)] mb-1.5 text-sm">{label}</p>
                            <pre className="bg-[var(--atelier-paper)] border border-[var(--atelier-line)] p-3 rounded-2xl text-[0.7rem] font-mono whitespace-pre-wrap">
                              {code}
                            </pre>
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
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="atelier-card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="relative flex-grow max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--atelier-faint)]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, tag, or slug…"
                  className="atelier-input !pl-11 !rounded-full"
                />
              </div>
              <button type="button" onClick={startNewArticle} className="atelier-btn atelier-btn-primary shrink-0">
                <Plus className="w-4 h-4" /> New article
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredArticles.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="atelier-card-lg py-20 sm:py-28 px-8 flex flex-col items-center text-center gap-5"
                  >
                    <div className="w-20 h-20 rounded-[1.75rem] bg-[var(--atelier-gold-soft)] flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[var(--atelier-gold)]" />
                    </div>
                    <div className="max-w-sm space-y-2">
                      <p className="font-headline text-2xl font-bold text-[var(--atelier-ink)]">
                        {searchQuery ? 'Nothing matched' : 'An empty atelier'}
                      </p>
                      <p className="text-[var(--atelier-muted)] leading-relaxed">
                        {searchQuery
                          ? 'Try another phrase.'
                          : 'Start a draft. AI can scaffold metadata and a cover prompt — you keep the voice.'}
                      </p>
                    </div>
                    {!searchQuery && (
                      <button type="button" onClick={startNewArticle} className="atelier-btn atelier-btn-gold">
                        <Plus className="w-4 h-4" /> Begin first piece
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
                      onPreview={(type, url) => setPreviewItem({ type, url })}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {filteredArticles.length > 0 && (
              <p className="text-center text-[0.7rem] text-[var(--atelier-faint)] tracking-wide pt-2 pb-4">
                Showing {filteredArticles.length} of {articles.length}
                {searchQuery ? ' matches' : ' pieces'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {mounted &&
        previewItem &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-xl"
            onClick={() => setPreviewItem(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-4xl rounded-[2rem] bg-[#1a1714] border border-white/10 p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--atelier-gold)] mb-2">
                Preview
              </p>
              <h3 className="font-headline text-lg font-bold text-white mb-6">
                {previewItem.type === 'cover' ? 'Cover image' : `Illustration · ${previewItem.type}`}
              </h3>
              <div className="rounded-[1.5rem] overflow-hidden bg-black/40 border border-white/5 min-h-[240px] flex items-center justify-center p-4">
                {previewItem.type === 'cover' && previewItem.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewItem.url} alt="" className="max-h-[65vh] w-auto rounded-xl object-contain" />
                ) : (
                  <div className="w-full max-w-md aspect-video">
                    {renderIllustration(previewItem.type === 'cover' ? 'diagram1' : previewItem.type, true)}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
