'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  LogOut,
  Receipt,
  Settings2,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { avatarForSession, type UserSession } from '@/lib/auth';
import {
  Categories,
  DealTypes,
  Months,
  PaymentModes,
  TaxClasses,
  Types,
  financialYearOptions,
  type LedgerEntry,
} from '@/lib/ledger-schema';
import { generateEntryForMonth, monthNeedsTruncation, parseFyStartYear } from '@/lib/ledger-engine';
import type { LedgerSettingsPublic } from '@/lib/ledger-types';
import { extractPdfText, fileLooksLikePdf, renderPdfPreviewImage } from '@/lib/ledger-pdf-client';
import { LedgerSelect } from '@/components/ledger/ledger-select';

type ExtractResponse = {
  data: LedgerEntry;
  validation_errors?: string[];
  status?: string;
  fusion?: string;
  error?: string;
};

function FieldLabel({
  label,
  hint,
  confidence,
}: {
  label: string;
  hint: string;
  confidence?: string;
}) {
  const tone =
    confidence === 'HIGH'
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
      : confidence === 'MEDIUM'
        ? 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20'
        : confidence === 'LOW'
          ? 'text-red-600 dark:text-red-300 bg-red-500/10 border-red-500/20'
          : confidence === 'ABSENT'
            ? 'text-[var(--atelier-faint)] bg-[var(--atelier-paper)] border-[var(--atelier-line)]'
            : '';

  return (
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <label className="atelier-label mb-0" title={hint}>
        {label}
      </label>
      {confidence && (
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${tone}`}>{confidence}</span>
      )}
    </div>
  );
}

function AmountStepper({
  name,
  value,
  onChange,
  onAdjust,
}: {
  name: 'amount' | 'netAmount' | 'gstAmount';
  value: number;
  onChange: (name: string, value: string) => void;
  onAdjust: (name: 'amount' | 'netAmount' | 'gstAmount', delta: number) => void;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        step="0.01"
        min="0"
        name={name}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(name, event.target.value)}
        className="atelier-input pr-28 font-mono"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-[var(--atelier-faint)]">
        {[-10, -1, 1, 10].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onAdjust(name, delta)}
            className="px-1.5 py-0.5 rounded hover:bg-[var(--atelier-paper)] hover:text-[var(--atelier-gold)]"
          >
            {delta > 0 ? `+${delta}` : delta}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LedgerClient({
  user,
  initialSettings,
}: {
  user: UserSession;
  initialSettings: LedgerSettingsPublic;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [showSettings, setShowSettings] = useState(!initialSettings.configured);
  const [notionToken, setNotionToken] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extraDetails, setExtraDetails] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extracted, setExtracted] = useState<LedgerEntry | null>(null);
  const [fusion, setFusion] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [provider, setProvider] = useState<'google' | 'openrouter'>(
    initialSettings.geminiConfigured || !initialSettings.openRouterConfigured ? 'google' : 'openrouter'
  );

  const fyOptions = useMemo(() => financialYearOptions(), []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop = useCallback((accepted: File[]) => {
    const next = accepted[0];
    if (!next) return;
    setFile(next);
    setExtracted(null);
    setSuccess(null);
    setError(null);
    setFusion(null);
    setSelectedMonths([]);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(next);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 6 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  });

  const updateField = (name: string, value: string | boolean | number) => {
    setExtracted((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleExtract = async () => {
    if (!file && !extraDetails.trim()) return;
    setIsExtracting(true);
    setError(null);
    setSuccess(null);
    try {
      let filePayload: { data: string; mimeType: string } | null = null;
      let fileText = '';

      if (file) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Read failed'));
          reader.onerror = () => reject(new Error('Read failed'));
          reader.readAsDataURL(file);
        });
        filePayload = { data: dataUrl, mimeType: file.type || 'application/octet-stream' };

        if (fileLooksLikePdf(file)) {
          try {
            fileText = await extractPdfText(file);
          } catch (pdfError) {
            console.warn('PDF text extract failed', pdfError);
          }
          if (fileText.replace(/\s/g, '').length < 40) {
            const preview = await renderPdfPreviewImage(file);
            if (preview) filePayload = { data: preview.dataUrl, mimeType: preview.mimeType };
          } else {
            filePayload = null;
          }
        }
      }

      const response = await fetch('/api/ledger/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: filePayload && filePayload.mimeType.startsWith('image/') ? filePayload : null,
          fileText,
          extraDetails,
          provider,
        }),
      });
      const payload = (await response.json()) as ExtractResponse;
      if (!response.ok) throw new Error(payload.error || 'Extraction failed');

      setExtracted(payload.data);
      setFusion(payload.fusion || payload.data.sourceFusion || null);
      setReviewNotes(payload.validation_errors || []);
      setSelectedMonths(payload.data.month ? [payload.data.month] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!extracted) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const monthly = extracted.isSubscription && extracted.subscriptionFrequency === 'Monthly';
      const payload =
        monthly && selectedMonths.length > 0
          ? selectedMonths.map((month) => generateEntryForMonth(extracted, month))
          : extracted;

      const response = await fetch('/api/ledger/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed');
      const count = Array.isArray(payload) ? payload.length : 1;
      setSuccess(`Saved ${count} ${count === 1 ? 'row' : 'rows'} to Notion.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async () => {
    setSettingsBusy(true);
    setSettingsMsg(null);
    try {
      const response = await fetch('/api/ledger/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionToken, databaseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save');
      setSettings(data);
      setNotionToken('');
      setDatabaseId('');
      setSettingsMsg(data.test?.ok ? `Connected${data.test.title ? ` — ${data.test.title}` : '.'}` : data.test?.error || 'Saved.');
    } catch (err) {
      setSettingsMsg(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSettingsBusy(false);
    }
  };

  const clearSettings = async () => {
    setSettingsBusy(true);
    try {
      const response = await fetch('/api/ledger/settings', { method: 'DELETE' });
      const data = await response.json();
      setSettings(data);
      setSettingsMsg('Cleared your saved Notion keys. Env fallback still applies if set.');
    } finally {
      setSettingsBusy(false);
    }
  };

  const originalDay = extracted?.date ? Number(extracted.date.split('-')[2]) || 15 : 15;
  const fyStart = parseFyStartYear(extracted?.financialYear, new Date().getFullYear());
  const truncationWarning =
    extracted &&
    originalDay > 28 &&
    selectedMonths.some((month) => {
      const monthIdx = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month);
      const year = monthIdx >= 3 ? fyStart : fyStart + 1;
      return monthNeedsTruncation(originalDay, month, year);
    });

  const flags = extracted?.confidence_flags || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--atelier-gold)]">
            Private atelier
          </p>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
            Finance Ledger
          </h1>
          <p className="text-sm text-[var(--atelier-muted)] max-w-xl leading-relaxed">
            Drop an invoice, add the extra context only you know, review the fused entry, then write it to your Notion books.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0">
          <div className="inline-flex p-1 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 shadow-[var(--atelier-shadow-sm)]">
            <button
              type="button"
              onClick={() => setProvider('google')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                provider === 'google'
                  ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                  : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
              }`}
            >
              Gemini
            </button>
            <button
              type="button"
              onClick={() => setProvider('openrouter')}
              disabled={!settings.openRouterConfigured}
              title={
                settings.openRouterModel
                  ? `Uses ${settings.openRouterModel} from .env`
                  : 'Set OPENROUTER_API_KEY and LEDGER_OPENROUTER_MODEL in .env'
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors disabled:opacity-40 ${
                provider === 'openrouter'
                  ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                  : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
              }`}
            >
              OpenRouter
            </button>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-card)] overflow-hidden shadow-[var(--atelier-shadow-sm)]">
            <div className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarForSession(user)}
                alt=""
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--atelier-gold)]/25"
              />
              <span className="font-headline text-xs font-bold text-[var(--atelier-ink)] truncate max-w-[7.5rem]">
                {user.name}
              </span>
            </div>
            <Link
              href="/api/auth/logout"
              title="Sign out"
              className="inline-flex h-9 w-9 items-center justify-center border-l border-[var(--atelier-line)] text-[var(--atelier-faint)] hover:text-red-600"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="atelier-card mb-6 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowSettings((prev) => !prev)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="w-4 h-4 text-[var(--atelier-gold)]" />
            Notion setup
            <span className="text-xs font-medium text-[var(--atelier-faint)]">
              {settings.configured ? `Connected (${settings.source}) ${settings.tokenHint || ''}` : 'Not connected'}
            </span>
          </span>
          {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showSettings && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <p className="sm:col-span-2 text-sm text-[var(--atelier-muted)] leading-relaxed">
              Create a Notion internal integration, share your ledger database with it, then paste the token and the
              database ID from the URL. Keys are encrypted and stored for your Google account only. Forks can also set{' '}
              <code className="text-xs">NOTION_API_KEY</code> and <code className="text-xs">NOTION_DATABASE_ID</code>.
            </p>
            <div>
              <label className="atelier-label">Integration token</label>
              <input
                type="password"
                autoComplete="off"
                value={notionToken}
                onChange={(event) => setNotionToken(event.target.value)}
                placeholder={settings.tokenHint || 'secret_… or ntn_…'}
                className="atelier-input"
              />
            </div>
            <div>
              <label className="atelier-label">Database ID</label>
              <input
                type="text"
                autoComplete="off"
                value={databaseId}
                onChange={(event) => setDatabaseId(event.target.value)}
                placeholder={settings.databaseIdHint || '32-character id from the Notion URL'}
                className="atelier-input"
              />
            </div>
            {!settings.aiConfigured && (
              <p className="sm:col-span-2 text-sm text-amber-700 dark:text-amber-300">
                No AI key is configured. Set GEMINI_API_KEY (default), or OPENROUTER_API_KEY and LEDGER_OPENROUTER_MODEL.
              </p>
            )}
            {settings.aiConfigured && (
              <p className="sm:col-span-2 text-xs text-[var(--atelier-faint)]">
                Gemini {settings.geminiConfigured ? settings.geminiModel : 'not set'}
                {' · '}
                OpenRouter {settings.openRouterModel || 'not set'} — change LEDGER_OPENROUTER_MODEL in .env, then restart the server.
              </p>
            )}
            {settingsMsg && <p className="sm:col-span-2 text-sm text-[var(--atelier-muted)]">{settingsMsg}</p>}
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button type="button" onClick={saveSettings} disabled={settingsBusy} className="atelier-btn atelier-btn-gold">
                {settingsBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & test
              </button>
              {settings.source === 'user' && (
                <button type="button" onClick={clearSettings} disabled={settingsBusy} className="atelier-btn atelier-btn-ghost">
                  Clear my keys
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5 space-y-4">
          <div
            {...getRootProps()}
            className={`atelier-card-lg cursor-pointer border-dashed px-6 py-10 text-center transition ${
              isDragActive ? 'border-[var(--atelier-gold)] bg-[var(--atelier-gold-soft)]' : ''
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-8 h-8 mx-auto mb-3 text-[var(--atelier-faint)]" />
            <p className="font-medium">{isDragActive ? 'Drop the invoice' : 'Drag in a PDF or photo'}</p>
            <p className="text-xs text-[var(--atelier-faint)] mt-1">PDF, PNG, JPG, WebP · 6 MB max</p>
          </div>

          <div>
            <label className="atelier-label">Your notes (trusted)</label>
            <textarea
              value={extraDetails}
              onChange={(event) => setExtraDetails(event.target.value)}
              placeholder="What the invoice cannot know: bank debit in INR, paid via IDFC WOW, this is the edudojo.ai domain for two years, GST not claimed…"
              className="atelier-input min-h-[140px] h-auto py-3 resize-y"
            />
            <p className="mt-1.5 text-xs text-[var(--atelier-faint)] leading-relaxed">
              These notes outrank the PDF when they conflict. The document still supplies vendor, invoice number, and printed totals.
            </p>
          </div>

          {file && (
            <div className="atelier-card px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-[var(--atelier-faint)]">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                className="atelier-icon-btn"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                }}
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleExtract}
            disabled={isExtracting || (!file && !extraDetails.trim())}
            className="atelier-btn atelier-btn-primary w-full justify-center py-3"
          >
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isExtracting ? 'Reading invoice + notes…' : 'Extract with notes'}
          </button>

          {previewUrl && file && !fileLooksLikePdf(file) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Invoice preview" className="atelier-card w-full h-auto max-h-[480px] object-contain p-3" />
          )}
          {previewUrl && file && fileLooksLikePdf(file) && (
            <iframe title="Invoice PDF" src={previewUrl} className="atelier-card w-full h-[480px] bg-[var(--atelier-paper)]" />
          )}
        </section>

        <section className="lg:col-span-7">
          <div className="atelier-card-lg min-h-[520px] overflow-hidden">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--atelier-muted)]">
                <Loader2 className="w-7 h-7 animate-spin text-[var(--atelier-gold)]" />
                <p>Fusing document text with your notes…</p>
              </div>
            ) : !extracted ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center text-[var(--atelier-muted)]">
                <Receipt className="w-8 h-8 mb-3 text-[var(--atelier-faint)]" />
                <p>Extract an invoice to review the ledger row here.</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--atelier-line)]">
                  <div>
                    <h2 className="text-sm font-semibold">Review before Notion</h2>
                    <p className="text-xs text-[var(--atelier-faint)]">Low-confidence fields are flagged. Edit anything.</p>
                  </div>
                  <button type="submit" disabled={isSaving || !settings.configured} className="atelier-btn atelier-btn-gold">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {extracted.isSubscription &&
                    extracted.subscriptionFrequency === 'Monthly' &&
                    selectedMonths.length > 1
                      ? `Save ${selectedMonths.length} rows`
                      : 'Save to Notion'}
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {error && (
                    <div className="flex gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="flex gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      {success}
                    </div>
                  )}
                  {(fusion || extracted.operatorOverrides?.length) && (
                    <div className="rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-gold-soft)] px-4 py-3 text-sm leading-relaxed">
                      <p className="font-semibold mb-1">How notes and the document were fused</p>
                      <p>{fusion || extracted.sourceFusion}</p>
                    </div>
                  )}
                  {reviewNotes.length > 0 && (
                    <ul className="text-sm text-amber-800 dark:text-amber-200 list-disc pl-5 space-y-1">
                      {reviewNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}

                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Transaction name" hint="Vendor / purpose — period" confidence={flags.transactionName} />
                      <input
                        required
                        name="transactionName"
                        value={extracted.transactionName || ''}
                        onChange={(event) => updateField('transactionName', event.target.value)}
                        className="atelier-input"
                      />
                    </div>
                    <div>
                      <FieldLabel label="Business purpose" hint="One sentence for a CA" confidence={flags.businessPurpose} />
                      <input
                        name="businessPurpose"
                        value={extracted.businessPurpose || ''}
                        onChange={(event) => updateField('businessPurpose', event.target.value)}
                        className="atelier-input"
                      />
                    </div>
                    <div>
                      <FieldLabel label="Notes" hint="FX, splits, extra context" confidence={flags.notes} />
                      <textarea
                        name="notes"
                        value={extracted.notes || ''}
                        onChange={(event) => updateField('notes', event.target.value)}
                        className="atelier-input min-h-[88px] h-auto py-3"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!extracted.isSubscription}
                      onChange={(event) => {
                        updateField('isSubscription', event.target.checked);
                        if (event.target.checked) updateField('dealType', 'Subscription');
                      }}
                    />
                    Recurring subscription
                  </label>

                  {extracted.isSubscription && (
                    <div className="space-y-3 rounded-2xl border border-[var(--atelier-line)] p-4">
                      <div>
                        <FieldLabel label="Billing cycle" hint="Monthly creates one Notion row per selected month" />
                        <LedgerSelect
                          name="subscriptionFrequency"
                          value={extracted.subscriptionFrequency || 'Monthly'}
                          options={['Monthly', 'Yearly', 'One-time']}
                          onChange={updateField}
                        />
                      </div>
                      {extracted.subscriptionFrequency === 'Monthly' && (
                        <>
                          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--atelier-faint)]">
                            <span>Months this FY</span>
                            <span className="space-x-2">
                              <button type="button" onClick={() => setSelectedMonths([...Months])}>
                                All 12
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = Months.indexOf(extracted.month as (typeof Months)[number]);
                                  setSelectedMonths(idx >= 0 ? Months.slice(0, idx + 1) : [extracted.month]);
                                }}
                              >
                                Up to {extracted.month}
                              </button>
                              <button type="button" onClick={() => setSelectedMonths([])}>
                                Clear
                              </button>
                            </span>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                            {Months.map((month) => {
                              const on = selectedMonths.includes(month);
                              return (
                                <button
                                  key={month}
                                  type="button"
                                  onClick={() =>
                                    setSelectedMonths((prev) =>
                                      prev.includes(month) ? prev.filter((item) => item !== month) : [...prev, month]
                                    )
                                  }
                                  className={`rounded-xl border px-2 py-2 text-xs ${
                                    on
                                      ? 'border-[var(--atelier-gold)] bg-[var(--atelier-gold-soft)]'
                                      : 'border-transparent text-[var(--atelier-faint)]'
                                  }`}
                                >
                                  {month.slice(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                          <div className="space-y-1 text-xs font-mono text-[var(--atelier-muted)] max-h-32 overflow-y-auto">
                            {selectedMonths.map((month) => {
                              const row = generateEntryForMonth(extracted, month);
                              return (
                                <div key={month} className="flex justify-between gap-2">
                                  <span className="truncate">{row.transactionName}</span>
                                  <span>
                                    {row.date} · ₹{Number(row.amount || 0).toFixed(2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {truncationWarning && (
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Billing day {originalDay} does not exist in some months, so those dates clamp to the last valid day.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel label="Type" hint="Direction of funds" confidence={flags.type} />
                      <LedgerSelect name="type" value={extracted.type} options={Types} onChange={updateField} />
                    </div>
                    <div>
                      <FieldLabel label="Category" hint="P&L bucket" confidence={flags.category} />
                      <LedgerSelect name="category" value={extracted.category} options={Categories} onChange={updateField} />
                    </div>
                    <div>
                      <FieldLabel label="Tax class" hint="Deductibility" confidence={flags.taxClass} />
                      <LedgerSelect name="taxClass" value={extracted.taxClass} options={TaxClasses} onChange={updateField} />
                    </div>
                    <div>
                      <FieldLabel label="Deal type" hint="Commercial shape" confidence={flags.dealType} />
                      <LedgerSelect name="dealType" value={extracted.dealType} options={DealTypes} onChange={updateField} />
                    </div>
                    <div>
                      <FieldLabel label="Amount INR" hint="Bank debit in rupees" confidence={flags.amount} />
                      <AmountStepper
                        name="amount"
                        value={extracted.amount}
                        onChange={(name, value) => updateField(name, Number(value) || 0)}
                        onAdjust={(name, delta) =>
                          updateField(name, Math.max(0, Number(((extracted[name] || 0) + delta).toFixed(2))))
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel label="Payment" hint="How it left the account" confidence={flags.paymentMode} />
                      <LedgerSelect name="paymentMode" value={extracted.paymentMode} options={PaymentModes} onChange={updateField} />
                    </div>
                    <div>
                      <FieldLabel label="Net" hint="Ex-GST" confidence={flags.netAmount} />
                      <AmountStepper
                        name="netAmount"
                        value={extracted.netAmount}
                        onChange={(name, value) => updateField(name, Number(value) || 0)}
                        onAdjust={(name, delta) =>
                          updateField(name, Math.max(0, Number(((extracted[name] || 0) + delta).toFixed(2))))
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel label="GST" hint="Tax component" confidence={flags.gstAmount} />
                      <AmountStepper
                        name="gstAmount"
                        value={extracted.gstAmount}
                        onChange={(name, value) => updateField(name, Number(value) || 0)}
                        onAdjust={(name, delta) =>
                          updateField(name, Math.max(0, Number(((extracted[name] || 0) + delta).toFixed(2))))
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel label="Vendor" hint="Legal billing name" confidence={flags.vendor} />
                      <input
                        value={extracted.vendor || ''}
                        onChange={(event) => updateField('vendor', event.target.value)}
                        className="atelier-input"
                      />
                    </div>
                    <div>
                      <FieldLabel label="Invoice #" hint="Vendor invoice id" confidence={flags.invoiceNumber} />
                      <input
                        value={extracted.invoiceNumber || ''}
                        onChange={(event) => updateField('invoiceNumber', event.target.value)}
                        className="atelier-input font-mono"
                      />
                    </div>
                    <div>
                      <FieldLabel label="Date" hint="Invoice date" confidence={flags.date} />
                      <input
                        type="date"
                        required
                        value={extracted.date || ''}
                        onChange={(event) => updateField('date', event.target.value)}
                        className="atelier-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel label="FY" hint="Indian FY" confidence={flags.financialYear} />
                        <LedgerSelect
                          name="financialYear"
                          value={extracted.financialYear}
                          options={fyOptions}
                          onChange={updateField}
                        />
                      </div>
                      <div>
                        <FieldLabel label="Month" hint="Calendar month" confidence={flags.month} />
                        <LedgerSelect name="month" value={extracted.month} options={[...Months]} onChange={updateField} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!extracted.idfcWowCard}
                        onChange={(event) => updateField('idfcWowCard', event.target.checked)}
                      />
                      IDFC WOW card
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!extracted.gstApplicable}
                        onChange={(event) => updateField('gstApplicable', event.target.checked)}
                      />
                      GST applicable
                    </label>
                  </div>

                  {extracted.chainOfThought && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowAudit((prev) => !prev)}
                        className="text-xs font-bold uppercase tracking-widest text-[var(--atelier-gold)]"
                      >
                        Audit trail {showAudit ? '▾' : '▸'}
                      </button>
                      {showAudit && (
                        <pre className="mt-2 whitespace-pre-wrap text-xs font-mono rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)] p-4 max-h-56 overflow-auto">
                          {extracted.chainOfThought}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
