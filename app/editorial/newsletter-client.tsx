'use client';

import './notes-curator.css';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleHelp,
  Loader2,
  Pen,
  Save,
  Send,
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
  { ssr: false, loading: () => <p className="nc-loading">Loading preview…</p> }
);
const MarkdownSourceEditor = dynamic(
  () => import('@/components/editor/markdown-source-editor').then((m) => m.MarkdownSourceEditor),
  {
    ssr: false,
    loading: () => <div className="nc-loading nc-loading-editor">Loading editor…</div>,
  }
);

type LayoutMode = 'write' | 'split' | 'preview';
type PreviewKind = 'page' | 'email';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A letter's Sunday, e.g. "6 Sep 2026". Anything that is not YYYY-MM-DD shows as it came. */
function formatWeekDate(weekOf: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(weekOf);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month) return weekOf || '—';
  return `${Number(match[3])} ${month} ${match[1]}`;
}

/** A receipt time, e.g. "6 Sep 2026, 19:00". An unreadable value shows as it came. */
function formatReceiptTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCount(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—';
}

function formatReadTime(seconds: number | null | undefined): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '—';
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

/** draft = hollow dot, happy or sending = papaya, sent = ink, skipped = plain. */
function StageStatus({ stage }: { stage: NewsletterWeek['stage'] }) {
  const tone =
    stage === 'sent'
      ? 'done'
      : stage === 'approved' || stage === 'sending'
        ? 'live'
        : stage === 'skipped'
          ? undefined
          : 'draft';
  return (
    <span className="atelier-status nc-status" data-tone={tone}>
      {stageLabel(stage)}
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

    // What the record already knows about this letter: who wrote the body, the happy mark, the send.
    const editedSinceBot = active.bodyMd !== active.draftMd;
    const recordLines: string[] = [];
    if (active.draftMd) {
      recordLines.push(
        editedSinceBot ? 'The body differs from the bot’s draft: your edits are kept.' : 'The body is still the bot’s draft.'
      );
    }
    if (active.curatorEditedAt) recordLines.push(`You last edited it on ${formatReceiptTime(active.curatorEditedAt)}.`);
    if (active.acknowledgedAt) recordLines.push(`Marked happy on ${formatReceiptTime(active.acknowledgedAt)}.`);
    if (active.sentAt) {
      const recipients = active.sentTo.length;
      recordLines.push(
        recipients
          ? `Sent on ${formatReceiptTime(active.sentAt)} to ${recipients.toLocaleString()} ${recipients === 1 ? 'person' : 'people'}.`
          : `Sent on ${formatReceiptTime(active.sentAt)}.`
      );
    }

    return (
      <div className="nc-editor">
        <header className="nc-editor-head">
          <button type="button" onClick={() => applyWeek(null)} className="atelier-link nc-back">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All letters
          </button>
          <div className="nc-editor-title">
            <h2>{title || 'Untitled letter'}</h2>
            <div className="atelier-meta">
              <span className="atelier-mono">{formatWeekDate(active.weekOf)}</span>
              <StageStatus stage={active.stage} />
              <span className="atelier-mono">{words.toLocaleString()} words</span>
            </div>
          </div>
        </header>

        <div className="atelier-toolbar nc-bar">
          <div className="nc-bar-views">
            <div className="atelier-tabs" role="group" aria-label="Layout">
              {(['write', 'split', 'preview'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={layoutMode === mode}
                  onClick={() => setLayoutMode(mode)}
                  className="atelier-tab"
                >
                  {mode === 'write' ? 'Write' : mode === 'split' ? 'Split' : 'Preview'}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={sidebarOpen}
              aria-controls="nc-details"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="atelier-tab"
            >
              Details
            </button>
          </div>
          <div className="nc-bar-actions">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveEdits()}
              className="atelier-btn atelier-btn-line"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
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
              className="atelier-btn atelier-btn-primary"
            >
              <Check className="h-4 w-4" aria-hidden="true" /> I&apos;m happy with this
            </button>
          </div>
          {status ? (
            <p role="status" className="atelier-notice nc-message" data-tone="ok">
              {status}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="atelier-notice nc-message" data-tone="warn">
              {error}
            </p>
          ) : null}
        </div>

        {locked ? (
          <p className="atelier-notice nc-locked">
            This letter is {active.stage === 'sent' ? 'sent' : 'skipped'}. Auto-publish and I&apos;m happy are locked. You can still save edits.
          </p>
        ) : null}

        <div className="atelier-stage nc-stage" data-mode={layoutMode}>
          {showWrite ? (
            <section className="nc-pane nc-write" aria-label="Write">
              <div className="nc-pane-head">
                <span className="nc-pane-label">Write</span>
                <div className="nc-tools" role="group" aria-label="Formatting">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyWrap('**', '**')}
                    className="atelier-icon-btn nc-tool"
                    title="Bold"
                    aria-label="Bold"
                  >
                    <span className="nc-tool-bold">B</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyWrap('*', '*')}
                    className="atelier-icon-btn nc-tool"
                    title="Italic"
                    aria-label="Italic"
                  >
                    <span className="nc-tool-italic">I</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyWrap('### ', '')}
                    className="atelier-icon-btn nc-tool"
                    title="Heading"
                    aria-label="Heading"
                  >
                    <span className="nc-tool-bold">H</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyWrap('[', '](url)')}
                    className="atelier-icon-btn nc-tool"
                    title="Link"
                    aria-label="Link"
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <MarkdownSourceEditor
                value={bodyMd}
                onChange={setBodyMd}
                placeholder="# Begin the letter…"
              />
              <div className="atelier-meta nc-pane-foot">
                <span className="atelier-mono">{words.toLocaleString()} words</span>
                <span className="atelier-mono">{chars.toLocaleString()} characters</span>
                <span>Markdown marks stay visible.</span>
              </div>
            </section>
          ) : null}

          {showPreview ? (
            <section className="nc-pane nc-preview" aria-label="Preview">
              <div className="nc-pane-head">
                <span className="nc-pane-label">Preview</span>
                <div className="atelier-tabs" role="group" aria-label="Preview as">
                  <button
                    type="button"
                    aria-pressed={previewKind === 'page'}
                    onClick={() => setPreview('page')}
                    className="atelier-tab"
                  >
                    Page
                  </button>
                  <button
                    type="button"
                    aria-pressed={previewKind === 'email'}
                    onClick={() => setPreview('email')}
                    className="atelier-tab"
                  >
                    Email
                  </button>
                </div>
              </div>
              <div className="nc-preview-body">
                {previewKind === 'email' ? (
                  <iframe
                    title="Email preview"
                    className="nc-email"
                    srcDoc={
                      previewHtml ||
                      '<body style="margin:0;padding:24px;font-family:sans-serif;color:GrayText"><p style="margin:0">Loading email preview…</p></body>'
                    }
                  />
                ) : bodyMd ? (
                  <div className="nc-letter">
                    <h2 className="nc-letter-title">{title || 'Untitled'}</h2>
                    {dek ? <p className="nc-letter-dek">{dek}</p> : null}
                    <div className="notes-prose article-prose">
                      <MarkdownPreview content={bodyMd} />
                    </div>
                  </div>
                ) : (
                  <p className="nc-blank">The page is blank. Write to see it here.</p>
                )}
              </div>
            </section>
          ) : null}
        </div>

        {sidebarOpen ? (
          <div className="nc-details" id="nc-details">
            <section className="nc-group" aria-labelledby="nc-identity">
              <div className="nc-group-head">
                <span className="atelier-mono">01</span>
                <h3 id="nc-identity" className="atelier-h3">Identity</h3>
              </div>
              <div className="nc-fields">
                <div className="nc-span-12">
                  <label className="atelier-label" htmlFor="nc-title">Title *</label>
                  <input
                    id="nc-title"
                    className="atelier-input nc-input-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="A title with quiet authority"
                  />
                </div>
                <div className="nc-span-6">
                  <label className="atelier-label" htmlFor="nc-subject">Subject</label>
                  <input
                    id="nc-subject"
                    className="atelier-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Inbox subject"
                  />
                </div>
                <div className="nc-span-6">
                  <label className="atelier-label" htmlFor="nc-slug">Slug</label>
                  <input
                    id="nc-slug"
                    className="atelier-input atelier-mono nc-input-mono"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
                <div className="nc-span-12">
                  <label className="atelier-label" htmlFor="nc-dek">Dek</label>
                  <input
                    id="nc-dek"
                    className="atelier-input nc-input-title"
                    value={dek}
                    onChange={(e) => setDek(e.target.value)}
                    placeholder="One elegant sentence…"
                  />
                </div>
              </div>
            </section>

            <section className="nc-group" aria-labelledby="nc-send">
              <div className="nc-group-head">
                <span className="atelier-mono">02</span>
                <h3 id="nc-send" className="atelier-h3">Send</h3>
              </div>
              <div className="nc-fields">
                <div className="nc-span-12">
                  <label className="nc-check">
                    <input
                      type="checkbox"
                      checked={autoPublish}
                      disabled={locked}
                      onChange={(e) => {
                        setAutoPublish(e.target.checked);
                        void act('autoPublish', { autoPublish: e.target.checked });
                      }}
                    />
                    <span className="nc-check-title">Auto-publish on Sunday at 19:00 local time</span>
                    <span className="nc-check-note">
                      On: the letter goes to each subscriber at their own local Sunday 19:00, even if you have not pressed happy. Off: it waits until you are happy, then goes out immediately.
                    </span>
                  </label>
                </div>
                <div className="nc-span-8">
                  <label className="atelier-label" htmlFor="nc-test">Send a test</label>
                  <input
                    id="nc-test"
                    type="email"
                    className="atelier-input"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="nc-span-4 nc-field-action">
                  <button
                    type="button"
                    className="atelier-btn atelier-btn-line nc-fill"
                    disabled={saving}
                    onClick={() => void sendTest()}
                  >
                    <Send className="h-4 w-4" aria-hidden="true" /> Send test
                  </button>
                </div>
                <div className="nc-span-12">
                  <button
                    type="button"
                    className="atelier-link nc-skip"
                    data-tone="warn"
                    disabled={saving || active.stage === 'sent'}
                    onClick={() => void act('skip', { note: 'Skipped by curator' })}
                  >
                    <SkipForward className="h-4 w-4" aria-hidden="true" /> Skip this week
                  </button>
                </div>
              </div>
            </section>

            {active.links.length ? (
              <section className="nc-group" aria-labelledby="nc-links">
                <div className="nc-group-head">
                  <span className="atelier-mono">03</span>
                  <h3 id="nc-links" className="atelier-h3">Go deeper</h3>
                </div>
                <ul className="nc-links">
                  {active.links.map((link: NewsletterLink) => (
                    <li key={link.url}>
                      <a href={link.url} className="nc-link" target="_blank" rel="noreferrer">
                        {link.label}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {recordLines.length ? (
              <section className="nc-group" aria-labelledby="nc-record">
                <div className="nc-group-head">
                  <span className="atelier-mono">{active.links.length ? '04' : '03'}</span>
                  <h3 id="nc-record" className="atelier-h3">Record</h3>
                </div>
                <ul className="nc-record">
                  {recordLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const issues = metrics?.issues ?? [];

  return (
    <div className="nc-list">
      <section className="atelier-section" aria-labelledby="nc-readers">
        <div className="atelier-section-head">
          <h2 id="nc-readers">
            Readers. <em>Subscribers, and how the last letter did.</em>
          </h2>
        </div>
        <ul className="nc-figures">
          <Figure label="Subscribers" value={formatCount(metrics?.subscribers)} />
          <Figure label="Last unique opens" value={formatCount(metrics?.lastUniqueOpens)} />
          <Figure
            label="Last median read time"
            value={formatReadTime(metrics?.lastMedianReadSeconds)}
            hint={READ_TIME_HINT}
            hintAlign="right"
          />
        </ul>

        {issues.length ? (
          <div className="nc-table-wrap">
            <table className="nc-table">
              <thead>
                <tr>
                  <th scope="col">Letter</th>
                  <th scope="col">Subscribers</th>
                  <th scope="col">Opens</th>
                  <th scope="col">
                    <span className="nc-th-tip">
                      Read time
                      <InfoTip label="How read time is measured" text={READ_TIME_HINT} align="right" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>{issue.title || issue.weekOf}</td>
                    <td className="nc-num" data-label="Subscribers">{formatCount(issue.subscribersAtSend)}</td>
                    <td className="nc-num" data-label="Opens">{formatCount(issue.uniqueOpens)}</td>
                    <td className="nc-num" data-label="Read time">{formatReadTime(issue.medianReadSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="atelier-section" aria-labelledby="nc-letters">
        <div className="atelier-section-head">
          <h2 id="nc-letters">
            Letters. <em>One for each Sunday.</em>
          </h2>
        </div>

        {error ? (
          <p role="alert" className="atelier-notice nc-locked" data-tone="warn">
            {error}
          </p>
        ) : null}

        {weeks.length === 0 ? (
          <div className="atelier-empty">
            <p>
              <strong>No letters yet.</strong>
              <br />
              The Grok Bot files a draft here every Saturday.
            </p>
          </div>
        ) : (
          <ul className="atelier-rows nc-rows">
            {weeks.map((week) => (
              <li key={week.id} className="atelier-row nc-row">
                <span className="atelier-mono nc-row-date">{formatWeekDate(week.weekOf)}</span>
                <div className="nc-row-main">
                  <button type="button" onClick={() => applyWeek(week)} className="nc-row-title">
                    {week.title || 'Untitled letter'}
                  </button>
                  {week.dek ? <p className="atelier-row-note nc-row-dek">{week.dek}</p> : null}
                  {week.autoPublish || week.acknowledgedAt ? (
                    <p className="atelier-meta nc-row-meta">
                      {week.autoPublish ? <span>Auto-publish on</span> : null}
                      {week.acknowledgedAt ? <span>Happy</span> : null}
                    </p>
                  ) : null}
                </div>
                <StageStatus stage={week.stage} />
                <div className="atelier-row-actions">
                  <button
                    type="button"
                    onClick={() => applyWeek(week)}
                    className="atelier-icon-btn"
                    title="Edit"
                    aria-label={`Edit ${week.title || 'untitled letter'}`}
                  >
                    <Pen className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
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
      className="nc-tip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="nc-tip-btn"
        aria-label={label}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <CircleHelp className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <span role="tooltip" className="nc-tip-pop" data-align={align}>
          {text}
        </span>
      ) : null}
    </span>
  );
}

/** One figure: a mono number over a short label. An empty value shows a dash and a short note. */
function Figure({
  label,
  value,
  hint,
  hintAlign = 'left',
}: {
  label: string;
  value: string;
  hint?: string;
  hintAlign?: 'left' | 'right';
}) {
  const empty = value === '—';
  return (
    <li className="nc-figure">
      <p className="nc-figure-value" data-empty={empty ? 'true' : undefined}>
        {value}
      </p>
      <p className="nc-figure-label">
        {label}
        {hint ? (
          <InfoTip label={`How ${label.toLowerCase()} is measured`} text={hint} align={hintAlign} />
        ) : null}
      </p>
      {empty ? <p className="nc-figure-note">Not available yet</p> : null}
    </li>
  );
}
