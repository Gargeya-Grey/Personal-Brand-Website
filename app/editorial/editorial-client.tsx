'use client';

import './workbench.css';

import {
  Component,
  useState,
  useEffect,
  useMemo,
  useDeferredValue,
  memo,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import * as motion from 'motion/react-client';
import { AnimatePresence, MotionConfig } from 'motion/react';
import {
  Plus, Search, ArrowLeft, X, ArrowUpRight, Pen, Trash2, Upload, Loader2,
  ImagePlus, Table2, SlidersHorizontal,
} from 'lucide-react';
import type { Article, ArticleLite } from '@/lib/blog-service';
import type { NewsletterWeek } from '@/lib/newsletter-model';
import { avatarForSession, type UserSession } from '@/lib/auth';
import Link from 'next/link';
import { CATEGORIES as CATEGORIES_LIST } from '@/lib/categories';
import { renderIllustration } from '@/components/render-illustration';
import { siteConfig } from '@/lib/site-config';
import { INTERACTIVE_EXAMPLE } from '@/lib/article-interactive-example';
import { articleWordCount } from '@/lib/article-markdown';

/** Quiet placeholder while a workspace chunk loads. */
function WorkspaceLoading({ label }: { label: string }) {
  return (
    <section className="atelier-section" role="status" aria-live="polite">
      <p className="atelier-meta">{label}</p>
    </section>
  );
}

const XStudioClient = dynamic(() => import('./x-studio-client').then((m) => m.XStudioClient), {
  ssr: false,
  loading: () => <WorkspaceLoading label="Loading queue…" />,
});
const XLabClient = dynamic(() => import('./x-lab-client').then((m) => m.XLabClient), {
  ssr: false,
  loading: () => <WorkspaceLoading label="Loading X Lab…" />,
});
const XGrowthStrategy = dynamic(
  () => import('./x-growth-strategy').then((m) => m.XGrowthStrategy),
  {
    ssr: false,
    loading: () => <WorkspaceLoading label="Loading strategy…" />,
  }
);
const NewsletterClient = dynamic(
  () => import('./newsletter-client').then((m) => m.NewsletterClient),
  {
    ssr: false,
    loading: () => <WorkspaceLoading label="Loading Notes…" />,
  }
);
const MarkdownPreview = dynamic(
  () => import('@/components/editor/markdown-preview').then((m) => m.MarkdownPreview),
  { ssr: false, loading: () => <p className="wb-blank">Loading preview…</p> }
);
const MarkdownSourceEditor = dynamic(
  () => import('@/components/editor/markdown-source-editor').then((m) => m.MarkdownSourceEditor),
  {
    ssr: false,
    loading: () => <div className="wb-editor-loading">Loading editor…</div>,
  }
);

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
        <section className="atelier-section wb-glitch">
          <div className="atelier-notice" data-tone="warn" role="alert">
            <div>
              <strong>X To-Do hit a glitch</strong>
              <p className="wb-glitch-message">
                {this.state.error.message || 'Unexpected render error'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="atelier-btn atelier-btn-line"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

type Workspace = 'blog' | 'x' | 'lab' | 'strategy' | 'notes';

interface EditorialClientProps {
  initialArticles: ArticleLite[];
  user: UserSession;
  /** From server searchParams — never sync URL during render/mount via history API */
  initialWorkspace?: Workspace;
  initialNotes?: NewsletterWeek[];
}

/** The page head for each workspace: a two-tone heading and an optional lead. */
const WORKSPACE_HEADS: Record<
  Workspace,
  { name: string; title: string; tail: string; lead?: string }
> = {
  blog: {
    name: 'Blog',
    title: 'Editorial.',
    tail: 'Shape essays with quiet control.',
    lead: 'AI for scaffolding, you for the voice.',
  },
  notes: {
    name: 'Notes',
    title: 'Notes.',
    tail: 'The weekly letter.',
    lead: 'Edit, preview, mark happy, or let Sunday 7pm local send it.',
  },
  x: {
    name: 'X To-Do',
    title: 'X To-Do.',
    tail: 'Focus queue for scout packs.',
    lead: 'Reply, post, mark done.',
  },
  lab: {
    name: 'X Lab',
    title: 'X Lab.',
    tail: 'Growth analytics from X API snapshots.',
    lead: 'Refresh, explore, ask the AI analyst.',
  },
  strategy: {
    name: 'Growth Strategy',
    title: 'Growth Strategy.',
    tail: 'What to post, when to sit down, and how to sound like yourself.',
  },
};

const ArticleRow = memo(function ArticleRow({
  post,
  onEdit,
  onDelete,
  isDeletingId,
  onPreview,
}: {
  post: ArticleLite;
  onEdit: (a: ArticleLite) => void;
  onDelete: (id: number) => void;
  isDeletingId: number | null;
  onPreview: (type: string, url?: string) => void;
}) {
  const isDraft = post.status === 'draft';
  const tags = post.categories.slice(0, 3).join(', ');
  return (
    <li className="atelier-row wb-row">
      <div className="wb-row-aside">
        <span className="atelier-mono">{post.date}</span>
        <span className="atelier-status" data-tone={isDraft ? 'draft' : 'live'}>
          {isDraft ? 'Draft' : 'Live'}
        </span>
        {post.featured && (
          <span className="atelier-status" data-tone="done">
            Featured
          </span>
        )}
      </div>

      <div className="wb-row-main">
        {post.illustrationType === 'cover' && post.coverImage && (
          <button
            type="button"
            className="wb-row-thumb"
            onClick={() => onPreview('cover', post.coverImage)}
            aria-label={`Preview cover of ${post.title}`}
            title="Preview cover"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt="" loading="lazy" />
          </button>
        )}
        <div className="wb-row-text">
          <h3 className="wb-row-title font-reading">{post.title}</h3>
          {post.excerpt && <p className="atelier-row-note">{post.excerpt}</p>}
          <p className="atelier-meta">
            <span className="atelier-mono">/{post.slug}</span>
            <span>{post.readTime}</span>
            {tags && <span>{tags}</span>}
          </p>
        </div>
      </div>

      <div className="atelier-row-actions wb-row-actions">
        <button type="button" onClick={() => onEdit(post)} className="atelier-icon-btn" title="Edit" aria-label={`Edit ${post.title}`}>
          <Pen className="w-4 h-4" />
        </button>
        <Link
          href={`/journal/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="atelier-icon-btn"
          title="View"
          aria-label={`View ${post.title}`}
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(post.id)}
          disabled={isDeletingId === post.id}
          className="atelier-icon-btn"
          data-tone="warn"
          title="Delete"
          aria-label={`Delete ${post.title}`}
        >
          {isDeletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </li>
  );
});

const WORKSPACE_KEY = 'editorial_workspace';

type XWorkspace = 'x' | 'lab' | 'strategy';

function WorkspaceSwitch({ active }: { active: XWorkspace }) {
  const tab = (id: XWorkspace, href: string, label: ReactNode) => (
    <Link
      href={href}
      prefetch
      aria-current={active === id ? 'page' : undefined}
      className="atelier-tab"
    >
      {label}
    </Link>
  );
  return (
    <nav className="atelier-tabs" aria-label="X workspace">
      {tab('x', '/editorial?workspace=x', 'X To-Do')}
      {tab('lab', '/editorial?workspace=lab', 'X Lab')}
      {tab(
        'strategy',
        '/editorial?workspace=strategy',
        <>
          <span className="sm:hidden">Strategy</span>
          <span className="hidden sm:inline">Growth Strategy</span>
        </>
      )}
    </nav>
  );
}

export function EditorialClient({
  initialArticles,
  user,
  initialWorkspace = 'blog',
  initialNotes = [],
}: EditorialClientProps) {
  const workspace = initialWorkspace;
  const [notesEditing, setNotesEditing] = useState(false);
  const [articles, setArticles] = useState<ArticleLite[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
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
  const [formTakeaways, setFormTakeaways] = useState<string[]>(['']);
  const [formContent, setFormContent] = useState('');
  const wordCount = useMemo(() => articleWordCount(formContent), [formContent]);
  const formReadTime = `${Math.ceil(wordCount / 200) || 1} min read`;
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
  const [metaProvider, setMetaProvider] = useState<'meta' | 'openrouter'>('meta');
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

    const wrappedOutside =
      start >= before.length &&
      end + after.length <= text.length &&
      text.substring(start - before.length, start) === before &&
      text.substring(end, end + after.length) === after;
    const wrappedInside =
      selected.length >= before.length + after.length &&
      selected.startsWith(before) &&
      selected.endsWith(after);

    let next: string;
    let selStart: number;
    let selEnd: number;

    if (wrappedOutside) {
      next =
        text.substring(0, start - before.length) + selected + text.substring(end + after.length);
      selStart = start - before.length;
      selEnd = selStart + selected.length;
    } else if (wrappedInside) {
      const inner = selected.slice(before.length, selected.length - after.length);
      next = text.substring(0, start) + inner + text.substring(end);
      selStart = start;
      selEnd = start + inner.length;
    } else {
      next = text.substring(0, start) + before + selected + after + text.substring(end);
      selStart = start + before.length;
      selEnd = selStart + selected.length;
    }

    setFormContent(next);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selStart, selEnd);
    }, 0);
  };

  const handleEditorFormatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const withMod = e.metaKey || e.ctrlKey;
    if (!withMod || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**');
    } else if (key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*');
    } else if (key === 'k') {
      e.preventDefault();
      insertMarkdown('[', '](url)');
    } else if (key === 'e') {
      e.preventDefault();
      insertMarkdown('`', '`');
    }
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
      alert('Please drop or pick a JPEG, PNG, WEBP, or GIF image.');
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

  // Client nav from X/Lab/Strategy → Blog reuses this component. Server skips the
  // article query on X workspaces, so state would stay [] until a hard refresh.
  // Sync-during-render keeps this a derived update (no cascading effect pass).
  const [prevInitialArticles, setPrevInitialArticles] = useState(initialArticles);
  if (initialArticles !== prevInitialArticles) {
    setPrevInitialArticles(initialArticles);
    if (initialArticles.length > 0) {
      setArticles(initialArticles);
    }
  }

  useEffect(() => {
    if (workspace !== 'blog' || articles.length > 0) return;
    let cancelled = false;
    fetch('/api/blog?includeAll=true', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setArticles(list);
      })
      .catch(() => {
        /* keep empty; hard refresh still works */
      });
    return () => {
      cancelled = true;
    };
  }, [workspace, articles.length]);

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
        body: JSON.stringify({ content: formContent, provider: metaProvider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-fill metadata.');
      const meta = data.metadata;
      if (meta.title) setFormTitle(meta.title);
      if (meta.slug) setFormSlug(meta.slug);
      if (meta.excerpt) setFormExcerpt(meta.excerpt);
      if (Array.isArray(meta.categories)) setFormCategories(meta.categories);
      if (Array.isArray(meta.takeaways)) setFormTakeaways(meta.takeaways.filter(Boolean));
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
    formTitle, formSlug, formExcerpt, formCategories, formReadTime,
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

  const filteredArticles = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [articles, deferredSearch]);

  const publishedCount = useMemo(
    () => articles.filter((a) => a.status === 'published').length,
    [articles]
  );
  const draftCount = useMemo(
    () => articles.filter((a) => a.status === 'draft').length,
    [articles]
  );
  const featuredCount = useMemo(
    () => articles.filter((a) => a.featured).length,
    [articles]
  );

  const startNewArticle = () => {
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormCategories(['Engineering']);
    setFormTakeaways(['']);
    setFormContent('');
    setFormFeatured(false);
    setFormStatus('draft');
    setFormCoverImage('');
    setEditingArticle({ id: undefined });
    setGeneratedImagePrompt('');
  };

  const startEditArticle = async (lite: ArticleLite) => {
    setFormTitle(lite.title);
    setFormSlug(lite.slug);
    setFormExcerpt(lite.excerpt);
    setFormCategories(lite.categories);
    setFormFeatured(!!lite.featured);
    setFormStatus(lite.status || 'published');
    setFormCoverImage(lite.coverImage || '');
    setGeneratedImagePrompt('');
    setEditingArticle({ id: lite.id } as Partial<Article>);
    try {
      const res = await fetch(`/api/blog?id=${lite.id}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load article');
      const full = data as Article;
      setFormTitle(full.title);
      setFormSlug(full.slug);
      setFormExcerpt(full.excerpt);
      setFormCategories(full.categories);
      setFormTakeaways(full.takeaways.length > 0 ? full.takeaways : ['']);
      setFormContent(full.content);
      setFormFeatured(!!full.featured);
      setFormStatus(full.status || 'published');
      setFormCoverImage(full.coverImage || '');
      setEditingArticle(full);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load article');
    }
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
        illustrationType: "cover",
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
      const saved = await res.json();
      const lite = saved.article ? (({ content: _c, takeaways: _t, ...rest }: Article) => rest)(saved.article as Article) as ArticleLite : null;
      if (lite) setArticles((prev) => {
        const idx = prev.findIndex((a) => a.id === lite.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = lite; return n; }
        return [lite, ...prev].sort((a, b) => b.id - a.id);
      });
      else {
        const refresh = await fetch('/api/blog?includeAll=true', { credentials: 'include' });
        if (refresh.ok) {
          const arr = (await refresh.json()) as Article[];
          setArticles(arr.map(({ content: _c, takeaways: _t, ...rest }) => rest as ArticleLite));
        }
      }
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
      setArticles((prev) => prev.filter((a) => a.id !== id));
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

  const charCount = formContent.length;

  const headConfig = WORKSPACE_HEADS[workspace];
  const showHead = !editingArticle && !(workspace === 'notes' && notesEditing);
  const isXWorkspace = workspace === 'x' || workspace === 'lab' || workspace === 'strategy';
  const saveStateLabel = isSaving
    ? 'Saving…'
    : lastAutosaved
      ? 'Local copy'
      : 'Not saved yet';

  return (
    <MotionConfig reducedMotion="user">
    <div className="atelier-page wb">
      {showHead && (
        <header className="atelier-head wb-head">
          <div className="atelier-head-row">
            <div className="wb-head-text">
              <p className="atelier-meta">
                <span>Private</span>
                <span>{headConfig.name}</span>
              </p>
              <h1>
                {headConfig.title} <em>{headConfig.tail}</em>
              </h1>
              {headConfig.lead && <p className="atelier-lead">{headConfig.lead}</p>}
              {workspace === 'blog' && (
                <ul className="atelier-facts" aria-label="Essay counts">
                  <li><b>{publishedCount}</b>live</li>
                  <li><b>{draftCount}</b>drafts</li>
                  <li><b>{featuredCount}</b>featured</li>
                </ul>
              )}
              {isXWorkspace && <WorkspaceSwitch active={workspace} />}
            </div>

            <div className="wb-identity">
              <div className="wb-who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarForSession(user)}
                  alt=""
                  width={28}
                  height={28}
                  className="wb-avatar"
                />
                <p className="wb-who-text">
                  <span className="wb-who-name">{user.name}</span>
                  <span className="wb-who-email">{user.email}</span>
                </p>
              </div>
              <div className="wb-identity-links">
                {workspace === 'blog' && (
                  <button type="button" onClick={exportJson} className="atelier-link">
                    Backup
                  </button>
                )}
                <Link href="/api/auth/logout" className="atelier-link" data-tone="warn">
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Draft recovery */}
      <AnimatePresence>
        {hasBackupDraft && !editingArticle && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="atelier-notice wb-notice"
            role="status"
          >
            <div className="wb-notice-body">
              <p className="wb-notice-title">Unsaved draft found</p>
              <p>Resume where you left off on this device, or discard the local snapshot.</p>
            </div>
            <div className="wb-notice-actions">
              <button type="button" onClick={handleRestoreDraft} className="atelier-btn atelier-btn-line">
                Restore
              </button>
              <button type="button" onClick={handleDiscardDraft} className="atelier-link">
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {workspace === 'x' && !editingArticle ? (
        <XStudioErrorBoundary>
          <XStudioClient />
        </XStudioErrorBoundary>
      ) : workspace === 'lab' && !editingArticle ? (
        <XStudioErrorBoundary>
          <XLabClient />
        </XStudioErrorBoundary>
      ) : workspace === 'strategy' && !editingArticle ? (
        <XStudioErrorBoundary>
          <XGrowthStrategy />
        </XStudioErrorBoundary>
      ) : workspace === 'notes' && !editingArticle ? (
        <XStudioErrorBoundary>
          <NewsletterClient initialWeeks={initialNotes} onEditingChange={setNotesEditing} />
        </XStudioErrorBoundary>
      ) : (
      <AnimatePresence mode="wait">
        {editingArticle ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="wb-editor"
          >
            {/* Sticky command bar */}
            <div className="atelier-toolbar wb-bar">
              <div className="wb-bar-lead">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="atelier-link"
                >
                  <ArrowLeft className="w-4 h-4" /> Library
                </button>
                <span
                  className="wb-bar-title font-reading"
                  data-empty={formTitle ? undefined : 'true'}
                  title={formTitle || undefined}
                >
                  {formTitle || 'Untitled essay'}
                </span>
                <span
                  className="atelier-status"
                  data-tone={isSaving || lastAutosaved ? 'live' : 'draft'}
                  role="status"
                  title={lastAutosaved ? 'Autosaved to this browser every 5 seconds' : undefined}
                >
                  {saveStateLabel}
                  {!isSaving && lastAutosaved && (
                    <span className="atelier-mono">{lastAutosaved}</span>
                  )}
                </span>
              </div>

              <div className="wb-bar-actions">
                <div role="group" aria-label="Editor layout" className="atelier-tabs wb-layout">
                  {(['write', 'split', 'preview'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditorLayoutMode(mode)}
                      aria-pressed={editorLayoutMode === mode}
                      className="atelier-tab"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-pressed={sidebarOpen}
                  className="atelier-btn atelier-btn-line"
                >
                  Meta
                </button>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  aria-pressed={showHelp}
                  className="atelier-btn atelier-btn-line"
                >
                  Format
                </button>
                <button type="button" onClick={() => setEditingArticle(null)} className="atelier-link">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="atelier-btn atelier-btn-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="wb-form">
              {sidebarOpen && (
                <section className="wb-meta" aria-label="Article metadata">
                  <div className="wb-meta-head">
                    <h2 className="atelier-h2">
                      Article metadata
                    </h2>
                    <div className="wb-meta-ai">
                      <div role="group" aria-label="AI provider" className="wb-chips">
                        {(['meta', 'openrouter'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setMetaProvider(p)}
                            aria-pressed={metaProvider === p}
                            className="atelier-chip"
                            title={p === 'meta' ? 'Muse Spark (default)' : 'OpenRouter'}
                          >
                            {p === 'meta' ? 'Meta' : 'OpenRouter'}
                          </button>
                        ))}
                      </div>
                      <label className="atelier-chip wb-chip-check" data-active={autoGenerateCoverImage}>
                        <input
                          type="checkbox"
                          checked={autoGenerateCoverImage}
                          onChange={(e) => setAutoGenerateCoverImage(e.target.checked)}
                          className="sr-only"
                        />
                        + Grok image
                      </label>
                      <button
                        type="button"
                        onClick={handleAiFill}
                        disabled={isAiFilling || isGeneratingImage}
                        className="atelier-btn atelier-btn-line"
                        title={`${metaProvider === 'meta' ? 'Meta' : 'OpenRouter'} · ${autoGenerateCoverImage ? 'Metadata + prompt + Grok image' : 'Metadata + copyable cover prompt only'}`}
                      >
                        {isAiFilling ? 'Curating…' : 'AI Fill'}
                      </button>
                    </div>
                  </div>

                  <section className="wb-meta-section">
                    <header className="wb-meta-section-head">
                      <span className="atelier-mono">01</span>
                      <h3 className="atelier-h3">Identity</h3>
                    </header>
                    <div className="wb-fields">
                      <div className="wb-span-12">
                        <label className="atelier-label" htmlFor="wb-title">Title *</label>
                        <input
                          id="wb-title"
                          className="atelier-input wb-input-title"
                          value={formTitle}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="A title with quiet authority"
                          required
                        />
                      </div>
                      <div className="wb-span-6">
                        <label className="atelier-label" htmlFor="wb-slug">Slug</label>
                        <input
                          id="wb-slug"
                          className="atelier-input wb-input-mono"
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          required
                        />
                      </div>
                      <div className="wb-span-3">
                        <span className="atelier-label" id="wb-status-label">Status</span>
                        <div role="group" aria-labelledby="wb-status-label" className="wb-chips wb-chips-field">
                          {(['draft', 'published'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFormStatus(s)}
                              aria-pressed={formStatus === s}
                              className="atelier-chip wb-cap"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="wb-span-3">
                        <span className="atelier-label">Feature</span>
                        <label className="wb-check">
                          <input
                            type="checkbox"
                            checked={formFeatured}
                            onChange={(e) => setFormFeatured(e.target.checked)}
                          />
                          <span>Feature on home</span>
                        </label>
                      </div>
                    </div>
                  </section>

                  <section className="wb-meta-section">
                    <header className="wb-meta-section-head">
                      <span className="atelier-mono">02</span>
                      <h3 className="atelier-h3">Summary &amp; display</h3>
                    </header>
                    <div className="wb-fields">
                      <div className="wb-span-12">
                        <label className="atelier-label" htmlFor="wb-excerpt">Excerpt</label>
                        <input
                          id="wb-excerpt"
                          className="atelier-input"
                          value={formExcerpt}
                          onChange={(e) => setFormExcerpt(e.target.value)}
                          placeholder="One elegant sentence…"
                        />
                      </div>
                      <div className="wb-span-12">
                        <label className="atelier-label" htmlFor="wb-cover">
                          Cover URL
                          {isGeneratingImage && (
                            <span className="wb-inline-note">Grok rendering…</span>
                          )}
                        </label>
                        <div className="wb-cover-row">
                          <input
                            id="wb-cover"
                            className="atelier-input"
                            value={formCoverImage}
                            onChange={(e) => setFormCoverImage(e.target.value)}
                            placeholder="https://… or upload"
                          />
                          <button
                            type="button"
                            onClick={triggerImageUpload}
                            disabled={isUploadingImage}
                            className="atelier-icon-btn wb-cover-btn"
                            title="Upload"
                            aria-label="Upload cover image"
                          >
                            {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          </button>
                          {formCoverImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewItem({ type: 'cover', url: formCoverImage })}
                              className="wb-cover-thumb"
                              title="Preview cover"
                              aria-label="Preview cover"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={formCoverImage} alt="" />
                            </button>
                          )}
                          <input id="local-cover-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleLocalImageUpload} />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="wb-meta-section">
                    <header className="wb-meta-section-head">
                      <span className="atelier-mono">03</span>
                      <h3 className="atelier-h3">Taxonomy</h3>
                    </header>
                    <div className="wb-chips">
                      {CATEGORIES_LIST.map((cat) => {
                        const active = formCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            data-active={active}
                            aria-pressed={active}
                            className="atelier-chip"
                          >
                            {cat}
                          </button>
                        );
                      })}
                      {formCategories
                        .filter((cat) => !(CATEGORIES_LIST as readonly string[]).includes(cat))
                        .map((cat) => (
                          <span key={cat} className="atelier-chip" data-active="true">
                            {cat}
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className="wb-chip-x"
                              aria-label={`Remove ${cat}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      <div className="wb-tag-add">
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
                          aria-label="Custom tag"
                          className="atelier-input wb-tag-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomTag()}
                          className="atelier-icon-btn wb-tag-btn"
                          aria-label="Add custom tag"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="wb-meta-section">
                    <header className="wb-meta-section-head">
                      <span className="atelier-mono">04</span>
                      <h3 className="atelier-h3">Key takeaways</h3>
                    </header>
                    <div className="wb-takeaways">
                      {formTakeaways.map((t, i) => (
                        <div key={i} className="wb-takeaway">
                          <input
                            className="atelier-input"
                            value={t}
                            onChange={(e) => updateTakeaway(i, e.target.value)}
                            placeholder="A crisp learning point…"
                            aria-label={`Takeaway ${i + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeTakeawayField(i)}
                            className="atelier-icon-btn wb-cover-btn"
                            aria-label={`Remove takeaway ${i + 1}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addTakeawayField} className="atelier-link wb-add">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </section>

                  {generatedImagePrompt && (
                    <section className="wb-meta-section">
                      <header className="wb-meta-section-head">
                        <span className="atelier-mono">05</span>
                        <h3 className="atelier-h3">Cover prompt</h3>
                      </header>
                      <div className="wb-prompt-block">
                        <p className="wb-prompt-lead">
                          Copy for free tools, or generate with Grok when you choose.
                        </p>
                        <p className="wb-prompt">{generatedImagePrompt}</p>
                        <div className="wb-prompt-actions">
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
                            className="atelier-btn atelier-btn-line"
                          >
                            {promptCopied ? 'Copied' : 'Copy prompt'}
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingImage || isAiFilling}
                            onClick={() => runGrokCoverGeneration(generatedImagePrompt, formSlug)}
                            className="atelier-btn atelier-btn-line"
                          >
                            {isGeneratingImage ? 'Grok…' : 'Generate with Grok'}
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </section>
              )}

              {/* Editor canvas */}
              <div className="wb-canvas">
                <div className="wb-panes" data-split={editorLayoutMode === 'split'}>
                  {(editorLayoutMode === 'split' || editorLayoutMode === 'write') && (
                    <div
                      className="atelier-stage wb-stage"
                      data-dragover={editorDragOver}
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
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => void handleInlineImageInput(e)}
                      />
                      <div className="wb-pane-head">
                        <div className="wb-pane-head-lead">
                          <span className="atelier-label">Write</span>
                          <div className="wb-fmt" role="toolbar" aria-label="Formatting">
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown('**', '**')} className="wb-fmt-btn wb-fmt-bold" title="Bold (Ctrl+B)" aria-label="Bold">B</button>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown('*', '*')} className="wb-fmt-btn wb-fmt-italic" title="Italic (Ctrl+I)" aria-label="Italic">I</button>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown('### ', '')} className="wb-fmt-btn" title="Heading" aria-label="Heading">H</button>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown('[', '](url)')} className="wb-fmt-btn" title="Link (Ctrl+K)" aria-label="Link"><ArrowUpRight className="w-3.5 h-3.5" /></button>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown('`', '`')} className="wb-fmt-btn" title="Inline code (Ctrl+E)" aria-label="Inline code">code</button>
                            <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className="wb-fmt-btn" title="Block" aria-label="Code block">{'{}'}</button>
                            <button
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => insertAtCursor(`\n\n${INTERACTIVE_EXAMPLE}\n\n`)}
                              className="wb-fmt-btn"
                              title="Insert an interactive HTML example"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" /> Interactive
                            </button>
                            <button
                              type="button"
                              onClick={insertTableTemplate}
                              className="wb-fmt-btn"
                              title="Insert table"
                              aria-label="Insert table"
                            >
                              <Table2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={triggerInlineImageUpload}
                              disabled={isUploadingInlineImage}
                              className="wb-fmt-btn"
                              title="Insert image"
                              aria-label="Insert image"
                            >
                              {isUploadingInlineImage ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ImagePlus className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <span className="atelier-mono">
                          {wordCount.toLocaleString()} w · {charCount.toLocaleString()} c · {formReadTime}
                        </span>
                      </div>
                      {editorDragOver && (
                        <div className="wb-drop">
                          <ImagePlus className="w-5 h-5" /> Drop image to insert
                        </div>
                      )}
                      <MarkdownSourceEditor
                        required
                        value={formContent}
                        onChange={setFormContent}
                        onKeyDown={handleEditorFormatKeyDown}
                        onPaste={(e) => void handleEditorPaste(e)}
                        placeholder="# Begin the piece…&#10;&#10;Tip: drag & drop or paste an image, or use the image button in the toolbar."
                      />
                      <p className="wb-hint">
                        Write pane styles markdown in place (marks stay visible). Ctrl+B bold · Ctrl+I italic · Ctrl+K link · Ctrl+E code.
                      </p>
                    </div>
                  )}

                  {(editorLayoutMode === 'split' || editorLayoutMode === 'preview') && (
                    <div className="wb-preview">
                      <div className="wb-pane-head">
                        <span className="atelier-label">Preview</span>
                      </div>
                      <div className="wb-preview-body">
                        {formContent ? (
                          <MarkdownPreview content={formContent} />
                        ) : (
                          <p className="wb-blank">The page is blank. Write to see light.</p>
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
                      className="wb-format"
                    >
                      <div className="wb-format-head">
                        <h3 className="atelier-h3">Format</h3>
                        <button type="button" onClick={() => setShowHelp(false)} className="atelier-icon-btn" aria-label="Close format guide">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="wb-format-list">
                        {[
                          { label: 'Headers', code: '# H1\n## H2\n### H3' },
                          { label: 'Emphasis', code: '**bold** *italic* `code`\nCtrl+B / Ctrl+I / Ctrl+E' },
                          { label: 'Quote', code: '> blockquote' },
                          { label: 'List', code: '- one\n- two' },
                          { label: 'Code', code: '```\ncode\n```' },
                          { label: 'Interactive HTML', code: '```interactive title="Try this" description="What to explore" height=360\n<style>/* CSS */</style>\n<!-- HTML -->\n<script>/* JavaScript */</script>\n```\n\nUse Interactive in the toolbar for a working example. Self-contained HTML, CSS and JavaScript; external scripts and network requests are blocked. Regular html code blocks stay as code.' },
                          { label: 'Link', code: '[text](https://…)' },
                          { label: 'Image', code: '![alt text](/covers/…)\nor use the image button / drag & drop' },
                          {
                            label: 'Table',
                            code: '| A | B |\n| --- | --- |\n| 1 | 2 |',
                          },
                        ].map(({ label, code }) => (
                          <div key={label} className="wb-format-item">
                            <p>{label}</p>
                            <pre>{code}</pre>
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
          >
            <section className="atelier-section">
              <div className="wb-listbar">
                <div className="wb-search">
                  <Search aria-hidden />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, tag, or slug…"
                    aria-label="Search essays"
                    className="atelier-input"
                  />
                </div>
                <button type="button" onClick={startNewArticle} className="atelier-btn atelier-btn-primary">
                  <Plus className="w-4 h-4" /> New article
                </button>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="atelier-empty">
                  <h3 className="atelier-h3">{searchQuery ? 'Nothing matched' : 'No essays yet'}</h3>
                  <p>
                    {searchQuery
                      ? 'Try another phrase.'
                      : 'Start a draft. AI can scaffold metadata and a cover prompt, and you keep the voice.'}
                  </p>
                  {!searchQuery && (
                    <button type="button" onClick={startNewArticle} className="atelier-btn atelier-btn-line">
                      <Plus className="w-4 h-4" /> Begin first piece
                    </button>
                  )}
                </div>
              ) : (
                <ul className="atelier-rows wb-rows">
                  {filteredArticles.map((post) => (
                    <ArticleRow
                      key={post.id}
                      post={post}
                      onEdit={startEditArticle}
                      onDelete={handleDelete}
                      isDeletingId={isDeletingId}
                      onPreview={(type, url) => setPreviewItem({ type, url })}
                    />
                  ))}
                </ul>
              )}

              {filteredArticles.length > 0 && (
                <p className="wb-count">
                  Showing <span className="atelier-mono">{filteredArticles.length}</span> of{' '}
                  <span className="atelier-mono">{articles.length}</span>
                  {searchQuery ? ' matches' : ' pieces'}
                </p>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {mounted &&
        previewItem &&
        createPortal(
          <div
            className="wb-lightbox"
            onClick={() => setPreviewItem(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Preview"
          >
            <div className="wb-lightbox-panel" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="atelier-icon-btn wb-lightbox-close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="atelier-label">Preview</p>
              <h3>
                {previewItem.type === 'cover' ? 'Cover image' : `Illustration · ${previewItem.type}`}
              </h3>
              <div className="wb-lightbox-media">
                {previewItem.type === 'cover' && previewItem.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewItem.url} alt="" />
                ) : (
                  <div className="wb-lightbox-art">
                    {renderIllustration(previewItem.type === 'cover' ? 'diagram1' : previewItem.type, true)}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
    </MotionConfig>
  );
}
