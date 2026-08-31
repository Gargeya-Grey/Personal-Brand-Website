'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleHelp,
  Eye,
  Loader2,
  Mail,
  Newspaper,
  Pen,
  Save,
  Send,
  Settings2,
  SkipForward,
} from 'lucide-react';
import {
  stageLabel,
  wordCount as countWords,
  type NewsletterDashboard,
  type NewsletterLink,
  type NewsletterWeek,
} from '@/lib/newsletter-model';

const MarkdownPreview = dynamic(
  () => import('@/components/editor/markdown-preview').then((m) => m.MarkdownPreview),
  { ssr: false, loading: () => <p className="text-sm italic text-[var(--atelier-faint)]">Loading preview…</p> }
);
const MarkdownSourceEditor = dynamic(
  () => import('@/components/editor/markdown-source-editor').then((m) => m.MarkdownSourceEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[260px] flex-grow text-sm italic text-[var(--atelier-faint)] sm:min-h-[360px]">
        Loading editor…
      </div>
    ),
  }
);

type LayoutMode = 'write' | 'split' | 'preview';
type PreviewKind = 'page' | 'email';

function formatReadTime(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function getEditor(): HTMLTextAreaElement | null {
  return document.querySelector('textarea[data-atelier-editor]') as HTMLTextAreaElement | null;
}

function wrapMarkdown(body: string, before: string, after: string, start: number, end: number) {
  const selected = body.slice(start, end);
  return {
    next: `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`,
    selStart: start + before.length,
    selEnd: start + before.length + selected.length,
  };
}

function StageBadge({ stage }: { stage: NewsletterWeek['stage'] }) {
  if (stage === 'sent') {
    return (
      <span className="atelier-chip !border-emerald-500/25 !bg-emerald-500/10 !text-emerald-800 dark:!text-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Sent
      </span>
    );
  }
  if (stage === 'approved' || stage === 'sending') {
    return (
      <span className="atelier-chip !border-[var(--atelier-gold)]/30 !bg-[var(--atelier-gold-soft)] !text-[var(--atelier-gold)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--atelier-gold)]" />
        {stageLabel(stage)}
      </span>
    );
  }
  if (stage === 'skipped') {
    return (
      <span className="atelier-chip">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--atelier-faint)]" />
        Skipped
      </span>
    );
  }
  return (
    <span className="atelier-chip !border-amber-500/25 !bg-amber-500/10 !text-amber-800 dark:!text-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Draft
    </span>
  );
}

export function NewsletterClient({
  initialWeeks,
  onEditingChange,
}: {
  initialWeeks: NewsletterWeek[];
  onEditingChange?: (editing: boolean) => void;
}) {
  const [weeks, setWeeks] = useState<NewsletterWeek[]>(initialWeeks);
  const [metrics, setMetrics] = useState<NewsletterDashboard | null>(null);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [previewKind, setPreviewKind] = useState<PreviewKind>('page');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [status, setStatus] = useState('');

  const [title, setTitle] = useState('');
  const [dek, setDek] = useState('');
  const [subject, setSubject] = useState('');
  const [slug, setSlug] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const active = useMemo(
    () => weeks.find((w) => w.id === activeId) || null,
    [weeks, activeId]
  );
  const words = countWords(bodyMd);
  const chars = bodyMd.length;
  const locked = active?.stage === 'sent' || active?.stage === 'skipped';

  const applyWeek = (week: NewsletterWeek | null) => {
    if (!week) {
      setActiveId(null);
      onEditingChange?.(false);
      return;
    }
    setActiveId(week.id);
    setTitle(week.title);
    setDek(week.dek);
    setSubject(week.subject);
    setSlug(week.slug);
    setBodyMd(week.bodyMd);
    setAutoPublish(week.autoPublish);
    setPreviewHtml('');
    setLayoutMode('split');
    setPreviewKind('page');
    setSidebarOpen(true);
    onEditingChange?.(true);
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/newsletter/metrics', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setMetrics(data as NewsletterDashboard);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const act = async (action: string, extra?: Record<string, unknown>) => {
    if (!active) return;
    setSaving(true);
    setStatus('');
    setError('');
    try {
      const res = await fetch('/api/newsletter/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active.id, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (data.week) {
        setWeeks((prev) => prev.map((w) => (w.id === data.week.id ? data.week : w)));
        setAutoPublish(Boolean(data.week.autoPublish));
      }
      if (action === 'acknowledge' && data.send) {
        setStatus(
          data.send.sent
            ? `Sent to ${data.send.sent} people.`
            : data.send.error || 'Marked happy. It will send on the Sunday slot if auto-publish is on, or immediately if not.'
        );
      } else {
        setStatus('Saved.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveEdits = () =>
    act('save', { title, dek, subject, bodyMd, slug, links: active?.links || [] });

  const loadEmailPreview = async () => {
    if (!active) return;
    const res = await fetch('/api/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: active.id, preview: true }),
    });
    const data = await res.json();
    if (res.ok && data.html) setPreviewHtml(data.html);
  };

  const setPreview = (kind: PreviewKind) => {
    setPreviewKind(kind);
    if (kind === 'email') void loadEmailPreview();
  };

  const applyWrap = (before: string, after: string) => {
    const textarea = getEditor();
    const start = textarea?.selectionStart ?? bodyMd.length;
    const end = textarea?.selectionEnd ?? bodyMd.length;
    const { next, selStart, selEnd } = wrapMarkdown(bodyMd, before, after, start, end);
    setBodyMd(next);
    requestAnimationFrame(() => {
      const editor = getEditor();
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(selStart, selEnd);
    });
  };

  const sendTest = async () => {
    if (!active || !testEmail.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active.id, test: testEmail.trim() }),
      });
      const data = await res.json();
      setStatus(data.ok ? `Test sent to ${testEmail.trim()}.` : data.error || data.send?.error || 'Test failed');
    } finally {
      setSaving(false);
    }
  };

  if (active) {
    const showWrite = layoutMode === 'write' || layoutMode === 'split';
    const showPreview = layoutMode === 'preview' || layoutMode === 'split';

    return (
      <div className="article-workbench space-y-6">
        <div className="sticky top-24 z-30">
          <div className="article-command-bar atelier-card-lg flex flex-col justify-between gap-3 bg-[color-mix(in_srgb,var(--atelier-card)_92%,transparent)] p-3 backdrop-blur-xl sm:p-3.5 xl:flex-row xl:items-center">
            <button
              type="button"
              onClick={() => applyWeek(null)}
              className="inline-flex items-center gap-2 px-2 py-1.5 text-sm font-bold text-[var(--atelier-muted)] transition-colors hover:text-[var(--atelier-ink)]"
            >
              <ArrowLeft className="h-4 w-4" /> Library
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={active.stage} />
              {status ? (
                <span className="atelier-chip !text-[0.65rem]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {status}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`atelier-btn h-10 text-xs ${sidebarOpen ? 'atelier-btn-gold' : 'atelier-btn-ghost'}`}
              >
                <Settings2 className="h-3.5 w-3.5" /> Meta
              </button>
              <div className="flex rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 p-1">
                {(['write', 'split', 'preview'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLayoutMode(mode)}
                    className={`rounded-full px-3.5 py-1.5 text-[0.7rem] font-bold capitalize transition-all ${
                      layoutMode === mode
                        ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)] shadow-md'
                        : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveEdits()}
                className="atelier-btn atelier-btn-primary h-10 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving' : 'Save'}
              </button>
              <button
                type="button"
                disabled={saving || locked}
                onClick={() => {
                  void (async () => {
                    await saveEdits();
                    await act('acknowledge');
                  })();
                }}
                className="atelier-btn atelier-btn-gold h-10 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> I&apos;m happy with this
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="article-workbench-form space-y-6">
          {sidebarOpen ? (
            <div className="article-metadata-panel atelier-card-lg p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[var(--atelier-line)] pb-6 sm:flex-row sm:items-start">
                <div>
                  <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--atelier-gold)]">
                    Curation
                  </p>
                  <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--atelier-ink)]">
                    Letter metadata
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="atelier-chip">{active.weekOf}</span>
                  <span className="atelier-chip tabular-nums">
                    {words.toLocaleString()} w · {chars.toLocaleString()} c
                  </span>
                </div>
              </div>

              <div className="mt-7 space-y-6">
                <section className="article-meta-section">
                  <header className="article-meta-section__head">
                    <span className="article-meta-section__index">1</span>
                    <h3 className="article-meta-section__title">Identity</h3>
                  </header>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                    <div className="md:col-span-12">
                      <label className="atelier-label">Title *</label>
                      <input
                        className="atelier-input !h-12 font-headline text-base font-semibold"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="A title with quiet authority"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="atelier-label">Subject</label>
                      <input
                        className="atelier-input !h-12"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Inbox subject"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="atelier-label">Slug</label>
                      <input
                        className="atelier-input !h-12 font-mono text-xs"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-12">
                      <label className="atelier-label">Dek</label>
                      <input
                        className="atelier-input"
                        value={dek}
                        onChange={(e) => setDek(e.target.value)}
                        placeholder="One elegant sentence…"
                      />
                    </div>
                  </div>
                </section>

                <section className="article-meta-section">
                  <header className="article-meta-section__head">
                    <span className="article-meta-section__index">2</span>
                    <h3 className="article-meta-section__title">Send</h3>
                  </header>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                    <div className="md:col-span-12">
                      <label className="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 px-3.5 py-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded accent-[var(--atelier-gold)]"
                          checked={autoPublish}
                          disabled={locked}
                          onChange={(e) => {
                            setAutoPublish(e.target.checked);
                            void act('autoPublish', { autoPublish: e.target.checked });
                          }}
                        />
                        <span>
                          <span className="block text-xs font-bold text-[var(--atelier-ink)]">
                            Auto-publish Sunday 7pm local
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-[var(--atelier-muted)]">
                            On: sends at the Sunday slot even if you have not pressed happy. Off: waits until you are happy, then goes immediately.
                          </span>
                        </span>
                      </label>
                    </div>
                    <div className="md:col-span-8">
                      <label className="atelier-label">Send a test</label>
                      <input
                        type="email"
                        className="atelier-input !h-12"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="flex items-end md:col-span-4">
                      <button
                        type="button"
                        className="atelier-btn atelier-btn-ghost h-12 w-full"
                        disabled={saving}
                        onClick={() => void sendTest()}
                      >
                        <Send className="h-4 w-4" /> Send test
                      </button>
                    </div>
                    <div className="md:col-span-12">
                      <button
                        type="button"
                        className="atelier-btn atelier-btn-ghost h-10 text-xs disabled:opacity-40"
                        disabled={saving || active.stage === 'sent'}
                        onClick={() => void act('skip', { note: 'Skipped by curator' })}
                      >
                        <SkipForward className="h-3.5 w-3.5" /> Skip this week
                      </button>
                    </div>
                  </div>
                </section>

                {active.links.length ? (
                  <section className="article-meta-section">
                    <header className="article-meta-section__head">
                      <span className="article-meta-section__index">3</span>
                      <h3 className="article-meta-section__title">Go deeper</h3>
                    </header>
                    <ul className="space-y-2 text-sm">
                      {active.links.map((link: NewsletterLink) => (
                        <li key={link.url}>
                          <a
                            href={link.url}
                            className="inline-flex items-center gap-1.5 text-[var(--atelier-gold)] hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {link.label}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="article-editor-canvas relative">
            <div
              className={`grid min-h-[520px] gap-5 ${
                layoutMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {showWrite ? (
                <div className="article-writing-pane atelier-card-lg relative flex min-h-[360px] flex-col p-5 focus-within:ring-2 focus-within:ring-[var(--atelier-gold)]/25 sm:min-h-[480px] sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--atelier-line)] pb-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--atelier-faint)]">
                        Write
                      </span>
                      <div className="flex flex-wrap items-center gap-0.5 border-l border-[var(--atelier-line)] pl-3">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyWrap('**', '**')}
                          className="h-8 w-8 rounded-xl text-xs font-bold text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)] hover:text-[var(--atelier-ink)]"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyWrap('*', '*')}
                          className="h-8 w-8 rounded-xl text-xs italic text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyWrap('### ', '')}
                          className="h-8 w-8 rounded-xl text-[0.65rem] font-bold text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]"
                          title="Heading"
                        >
                          H
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyWrap('[', '](url)')}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--atelier-muted)] hover:bg-[var(--atelier-gold-soft)]"
                          title="Link"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="shrink-0 text-[0.65rem] font-medium tabular-nums text-[var(--atelier-faint)]">
                      {words.toLocaleString()} w · {chars.toLocaleString()} c
                    </span>
                  </div>
                  <MarkdownSourceEditor
                    value={bodyMd}
                    onChange={setBodyMd}
                    placeholder="# Begin the letter…"
                  />
                  <p className="pt-3 text-[0.65rem] text-[var(--atelier-faint)]">
                    Write pane styles markdown in place. Marks stay visible.
                  </p>
                </div>
              ) : null}

              {showPreview ? (
                <div className="article-preview-pane atelier-card-lg flex min-h-[360px] flex-col bg-[color-mix(in_srgb,var(--atelier-paper)_55%,var(--atelier-card))] p-5 sm:min-h-[480px] sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--atelier-line)] pb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[var(--atelier-gold)]" />
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--atelier-faint)]">
                        Preview
                      </span>
                    </div>
                    <div className="flex rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 p-1">
                      <button
                        type="button"
                        onClick={() => setPreview('page')}
                        className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold ${
                          previewKind === 'page'
                            ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                            : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                        }`}
                      >
                        Page
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreview('email')}
                        className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold ${
                          previewKind === 'email'
                            ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                            : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-grow overflow-y-auto">
                    {previewKind === 'email' ? (
                      <iframe
                        title="Email preview"
                        className="h-[min(70vh,40rem)] w-full rounded-[1.25rem] border border-[var(--atelier-line)] bg-white"
                        srcDoc={
                          previewHtml ||
                          '<p style="padding:24px;font-family:sans-serif;color:#64748b">Loading email preview…</p>'
                        }
                      />
                    ) : bodyMd ? (
                      <div className="text-left">
                        <h2 className="mb-2 font-headline text-3xl font-bold tracking-tight text-[var(--atelier-ink)]">
                          {title || 'Untitled'}
                        </h2>
                        {dek ? <p className="mb-6 text-[var(--atelier-muted)]">{dek}</p> : null}
                        <div className="notes-prose article-prose">
                          <MarkdownPreview content={bodyMd} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm italic text-[var(--atelier-faint)]">The page is blank — write to see light.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Subscribers" value={metrics?.subscribers ?? '—'} />
        <MetricCard label="Last unique opens" value={metrics?.lastUniqueOpens ?? '—'} />
        <MetricCard
          label="Last median read time"
          value={formatReadTime(metrics?.lastMedianReadSeconds ?? null)}
          hint={READ_TIME_HINT}
        />
      </div>
      {metrics?.issues?.length ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--atelier-line)]">
          <table className="w-full text-left text-sm">
            <thead className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--atelier-faint)]">
              <tr>
                <th className="px-4 py-3 font-medium">Letter</th>
                <th className="px-4 py-3 font-medium">Subscribers</th>
                <th className="px-4 py-3 font-medium">Opens</th>
                <th className="px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    Read time
                    <InfoTip label="How read time is measured" text={READ_TIME_HINT} align="right" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.issues.map((issue) => (
                <tr key={issue.id} className="border-t border-[var(--atelier-line)]">
                  <td className="px-4 py-3 text-[var(--atelier-ink)]">{issue.title || issue.weekOf}</td>
                  <td className="px-4 py-3 text-[var(--atelier-muted)]">{issue.subscribersAtSend ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--atelier-muted)]">{issue.uniqueOpens ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--atelier-muted)]">
                    {formatReadTime(issue.medianReadSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {weeks.length === 0 ? (
        <div className="atelier-card-lg flex flex-col items-center gap-5 px-8 py-20 text-center sm:py-28">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[var(--atelier-gold-soft)]">
            <Newspaper className="h-8 w-8 text-[var(--atelier-gold)]" />
          </div>
          <div className="max-w-sm space-y-2">
            <p className="font-headline text-2xl font-bold text-[var(--atelier-ink)]">No letters yet</p>
            <p className="leading-relaxed text-[var(--atelier-muted)]">
              The Grok Bot files a draft here every Saturday.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <article
              key={week.id}
              className="atelier-card group flex flex-col gap-5 p-4 transition-shadow duration-300 hover:shadow-[var(--atelier-shadow)] sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex h-[96px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] border border-[var(--atelier-line)] bg-[var(--atelier-paper)] sm:w-[148px]">
                <Mail className="h-7 w-7 text-[var(--atelier-gold)]" />
              </div>
              <div className="min-w-0 flex-1 space-y-2.5">
                <StageBadge stage={week.stage} />
                <h3 className="font-headline text-xl font-bold leading-snug tracking-tight text-[var(--atelier-ink)] transition-colors group-hover:text-[var(--atelier-gold)] sm:text-[1.35rem]">
                  {week.title || 'Untitled letter'}
                </h3>
                {week.dek ? (
                  <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-[var(--atelier-muted)]">
                    {week.dek}
                  </p>
                ) : null}
                <p className="text-[0.7rem] font-medium tracking-wide text-[var(--atelier-faint)]">
                  {week.weekOf}
                  {week.autoPublish ? ' · auto-publish on' : ''}
                  {week.acknowledgedAt ? ' · happy' : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => applyWeek(week)}
                  className="atelier-icon-btn"
                  title="Edit"
                  aria-label="Edit"
                >
                  <Pen className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const READ_TIME_HINT =
  'Visible time on the public letter page (/notes/…), not time in the inbox. The tab pings every 15 seconds while it is in front. Each visit is a random session id, not an email. Sessions under 20 seconds are ignored. We take the median of the rest, capped at 20 minutes. Reloading the same tab counts as the same session.';

function InfoTip({
  label,
  text,
  align = 'left',
}: {
  label: string;
  text: string;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--atelier-faint)] transition-colors hover:text-[var(--atelier-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--atelier-gold)]"
        aria-label={label}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <span
          role="tooltip"
          className={`absolute top-full z-40 mt-2 w-[min(18rem,calc(100vw-3rem))] rounded-xl border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-3 text-left text-[0.7rem] font-normal normal-case leading-relaxed tracking-normal text-[var(--atelier-muted)] shadow-[var(--atelier-shadow)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  hintAlign = 'right',
}: {
  label: string;
  value: string | number;
  hint?: string;
  hintAlign?: 'left' | 'right';
}) {
  return (
    <div className="atelier-card-lg relative overflow-visible p-5">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--atelier-faint)]">
        {label}
        {hint ? (
          <InfoTip label={`How ${label.toLowerCase()} is measured`} text={hint} align={hintAlign} />
        ) : null}
      </p>
      <p className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--atelier-ink)]">{value}</p>
    </div>
  );
}
