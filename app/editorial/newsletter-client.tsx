'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Check,
  Mail,
  Newspaper,
  Save,
  Send,
} from 'lucide-react';
import {
  stageLabel,
  wordCount,
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
  { ssr: false, loading: () => <div className="min-h-[260px] text-sm italic text-[var(--atelier-faint)]">Loading editor…</div> }
);

function formatReadTime(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function NewsletterClient({ initialWeeks }: { initialWeeks: NewsletterWeek[] }) {
  const [weeks, setWeeks] = useState<NewsletterWeek[]>(initialWeeks);
  const [metrics, setMetrics] = useState<NewsletterDashboard | null>(null);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMode, setPreviewMode] = useState<'write' | 'page' | 'email'>('write');
  const [status, setStatus] = useState('');

  const [title, setTitle] = useState('');
  const [dek, setDek] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const active = useMemo(
    () => weeks.find((w) => w.id === activeId) || null,
    [weeks, activeId]
  );

  const applyWeek = (week: NewsletterWeek) => {
    setActiveId(week.id);
    setTitle(week.title);
    setDek(week.dek);
    setSubject(week.subject);
    setBodyMd(week.bodyMd);
    setAutoPublish(week.autoPublish);
    setPreviewHtml('');
    setPreviewMode('write');
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
            : data.send.error || 'Saved as happy. Waiting for Sunday 19:00 local if auto-publish is on.'
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
    act('save', { title, dek, subject, bodyMd, links: active?.links || [] });

  const loadEmailPreview = async () => {
    if (!active) return;
    setPreviewMode('email');
    const res = await fetch('/api/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: active.id, preview: true }),
    });
    const data = await res.json();
    if (res.ok && data.html) setPreviewHtml(data.html);
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Subscribers" value={metrics?.subscribers ?? '—'} />
        <MetricCard label="Last unique opens" value={metrics?.lastUniqueOpens ?? '—'} />
        <MetricCard label="Last median read time" value={formatReadTime(metrics?.lastMedianReadSeconds ?? null)} />
      </div>
      {metrics?.issues?.length ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--atelier-line)]">
          <table className="w-full text-left text-sm">
            <thead className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--atelier-faint)]">
              <tr>
                <th className="px-4 py-3 font-medium">Letter</th>
                <th className="px-4 py-3 font-medium">Subscribers</th>
                <th className="px-4 py-3 font-medium">Opens</th>
                <th className="px-4 py-3 font-medium">Read time</th>
              </tr>
            </thead>
            <tbody>
              {metrics.issues.map((issue) => (
                <tr key={issue.id} className="border-t border-[var(--atelier-line)]">
                  <td className="px-4 py-3 text-[var(--atelier-ink)]">{issue.title || issue.weekOf}</td>
                  <td className="px-4 py-3 text-[var(--atelier-muted)]">{issue.subscribersAtSend ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--atelier-muted)]">{issue.uniqueOpens ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--atelier-muted)]">{formatReadTime(issue.medianReadSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-[var(--atelier-gold)]">{status}</p> : null}

      {active ? (
        <article className="space-y-6">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="atelier-btn atelier-btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" /> All letters
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="atelier-chip">{stageLabel(active.stage)}</span>
            <span className="text-xs text-[var(--atelier-faint)]">{active.weekOf}</span>
            <span className="text-xs text-[var(--atelier-faint)]">{wordCount(bodyMd)} words</span>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/40 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-emerald-600"
              checked={autoPublish}
              disabled={active.stage === 'sent' || active.stage === 'skipped'}
              onChange={(e) => {
                setAutoPublish(e.target.checked);
                void act('autoPublish', { autoPublish: e.target.checked });
              }}
            />
            <span>
              <span className="block font-headline text-sm font-bold text-[var(--atelier-ink)]">
                Auto-publish Sunday 7pm local
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--atelier-muted)]">
                On: each subscriber gets it Sunday 19:00 in their timezone, even if you have not pressed happy.
                Off: nothing goes until you are happy, then it sends immediately.
              </span>
            </span>
          </label>

          <div className="grid gap-4">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="atelier-input w-full"
              />
            </Field>
            <Field label="One-line dek">
              <input value={dek} onChange={(e) => setDek(e.target.value)} className="atelier-input w-full" />
            </Field>
            <Field label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="atelier-input w-full"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <TabBtn active={previewMode === 'write'} onClick={() => setPreviewMode('write')}>
              Write
            </TabBtn>
            <TabBtn active={previewMode === 'page'} onClick={() => setPreviewMode('page')}>
              Page preview
            </TabBtn>
            <TabBtn active={previewMode === 'email'} onClick={() => void loadEmailPreview()}>
              Email preview
            </TabBtn>
          </div>

          {previewMode === 'write' ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--atelier-line)]">
              <MarkdownSourceEditor
                value={bodyMd}
                onChange={setBodyMd}
                placeholder="The letter…"
              />
            </div>
          ) : previewMode === 'page' ? (
            <div className="atelier-card-lg prose-notes px-6 py-8 sm:px-10">
              <h2 className="mb-2 font-display text-3xl text-[var(--atelier-ink)]">{title || 'Untitled'}</h2>
              {dek ? <p className="mb-6 text-[var(--atelier-muted)]">{dek}</p> : null}
              <div className="font-body text-base leading-relaxed text-[var(--atelier-ink)]">
                <MarkdownPreview content={bodyMd} />
              </div>
            </div>
          ) : (
            <iframe
              title="Email preview"
              className="h-[640px] w-full rounded-[1.5rem] border border-[var(--atelier-line)] bg-white"
              srcDoc={previewHtml || '<p style="padding:24px;font-family:sans-serif;color:#64748b">Loading…</p>'}
            />
          )}

          {active.links.length ? (
            <ul className="space-y-1 text-sm text-[var(--atelier-muted)]">
              {active.links.map((link: NewsletterLink) => (
                <li key={link.url}>
                  <a href={link.url} className="text-[var(--atelier-gold)] underline" target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" className="atelier-btn atelier-btn-primary" disabled={saving} onClick={() => void saveEdits()}>
              <Save className="h-4 w-4" /> Save edits
            </button>
            <button
              type="button"
              className="atelier-btn atelier-btn-gold"
              disabled={saving || active.stage === 'sent' || active.stage === 'skipped'}
              onClick={() => void act('acknowledge')}
            >
              <Check className="h-4 w-4" /> I&apos;m happy with this
            </button>
            <button
              type="button"
              className="atelier-btn atelier-btn-ghost"
              disabled={saving || active.stage === 'sent'}
              onClick={() => void act('skip', { note: 'Skipped by curator' })}
            >
              Skip this week
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test email"
              className="atelier-input sm:max-w-xs"
            />
            <button type="button" className="atelier-btn atelier-btn-ghost" disabled={saving} onClick={() => void sendTest()}>
              <Send className="h-4 w-4" /> Send test
            </button>
          </div>
        </article>
      ) : (
        <div className="space-y-4">
          {weeks.length === 0 ? (
            <div className="atelier-card-lg py-16 text-center">
              <Newspaper className="mx-auto mb-4 h-8 w-8 text-[var(--atelier-gold)]" />
              <p className="font-headline text-lg font-bold text-[var(--atelier-ink)]">No letters yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--atelier-muted)]">
                The Grok Bot files a draft here every Saturday. Run ingest, or wait for the first Saturday 19:00 IST job.
              </p>
            </div>
          ) : (
            weeks.map((week) => (
              <button
                key={week.id}
                type="button"
                onClick={() => applyWeek(week)}
                className="atelier-card-lg flex w-full flex-col gap-2 p-5 text-left transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-headline text-lg font-bold text-[var(--atelier-ink)]">
                    {week.title || 'Untitled letter'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--atelier-muted)]">
                    {week.weekOf} · {stageLabel(week.stage)}
                    {week.autoPublish ? ' · auto-publish on' : ''}
                    {week.acknowledgedAt ? ' · happy' : ''}
                  </p>
                </div>
                <Mail className="h-4 w-4 shrink-0 text-[var(--atelier-faint)]" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="atelier-card-lg p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--atelier-faint)]">{label}</p>
      <p className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--atelier-ink)]">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-faint)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
        active
          ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
          : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
      }`}
    >
      {children}
    </button>
  );
}
