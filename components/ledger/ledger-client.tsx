'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { generateEntryForMonth, indianFyFromDate, monthNeedsTruncation, parseFyStartYear } from '@/lib/ledger-engine';
import type { LedgerSettingsPublic } from '@/lib/ledger-types';
import { extractPdfText, fileLooksLikePdf, renderPdfPreviewImage } from '@/lib/ledger-pdf-client';
import { harvestDocumentSignals } from '@/lib/ledger-parse';
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
  htmlFor,
}: {
  label: string;
  hint: string;
  confidence?: string;
  htmlFor?: string;
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
    <div className="flex items-center justify-between gap-2">
      <label className="atelier-label mb-0" title={hint} htmlFor={htmlFor} id={htmlFor ? `${htmlFor}-label` : undefined}>
        {label}
      </label>
      {confidence && (
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${tone}`}>{confidence}</span>
      )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--atelier-line)] bg-[color-mix(in_srgb,var(--atelier-paper)_40%,transparent)] p-4 sm:p-5">
      <h3 className="atelier-label !mb-4">{title}</h3>
      {children}
    </section>
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
        id={name}
        aria-labelledby={`${name}-label`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-[var(--atelier-faint)]">
        {[-10, -1, 1, 10].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onAdjust(name, delta)}
            aria-label={`${delta > 0 ? 'Increase' : 'Decrease'} ${name} by ${Math.abs(delta)}`}
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
  const [showAudit, setShowAudit] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [provider, setProvider] = useState<'google' | 'openrouter'>(
    initialSettings.geminiConfigured || !initialSettings.openRouterConfigured ? 'google' : 'openrouter'
  );
  const [statusMessage, setStatusMessage] = useState('');
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);

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
    setExtracted((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [name]: value };
      if (name === 'date' && typeof value === 'string') {
        const fy = indianFyFromDate(value);
        if (fy) {
          next.financialYear = fy.financialYear;
          next.month = fy.month;
        }
      }
      return next;
    });
  };

  const resetInvoice = () => {
    setFile(null);
    setExtracted(null);
    setExtraDetails('');
    setFusion(null);
    setReviewNotes([]);
    setError(null);
    setSuccess(null);
    setSelectedMonths([]);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatusMessage('Ready for the next invoice.');
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
          const harvest = harvestDocumentSignals(fileText, extraDetails);
          const textTooThin = fileText.replace(/\s/g, '').length < 40;
          if (textTooThin || !harvest.complete) {
            const preview = await renderPdfPreviewImage(file);
            if (preview) filePayload = { data: preview.dataUrl, mimeType: preview.mimeType };
            else if (!textTooThin) filePayload = null;
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
      setStatusMessage(
        payload.validation_errors?.length
          ? `Extracted with ${payload.validation_errors.length} fields to review.`
          : `Extracted ${payload.data.vendor || 'entry'} for ${payload.data.date || 'review'}.`
      );
      window.requestAnimationFrame(() => reviewHeadingRef.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
      setStatusMessage('Extraction failed.');
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
      setStatusMessage(`Saved ${count} ${count === 1 ? 'row' : 'rows'} to Notion.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (!item.type.startsWith('image/')) continue;
        const blob = item.getAsFile();
        if (!blob) continue;
        event.preventDefault();
        onDrop([new File([blob], `pasted-receipt-${Date.now()}.png`, { type: blob.type })]);
        setStatusMessage('Pasted screenshot attached.');
        return;
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onDrop]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') return;
      if (isExtracting || (!file && !extraDetails.trim())) return;
      event.preventDefault();
      void handleExtract();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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
    <div className="w-full max-w-[96%] 2xl:max-w-[1700px] mx-auto px-4 sm:px-6 md:px-10">
      <header className="mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--atelier-gold)]">
            Private atelier
          </p>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
            Finance Ledger
          </h1>
          <p className="text-sm text-[var(--atelier-muted)] max-w-2xl leading-relaxed">
            Drop an invoice, add what only you know, review the fused row, save to Notion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/70 text-xs font-mono text-[var(--atelier-muted)] shadow-[var(--atelier-shadow-sm)]"
            title={`Active ${provider === 'google' ? 'GEMINI_MODEL' : 'LEDGER_OPENROUTER_MODEL'} environment variable`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[var(--atelier-faint)] text-[10px] uppercase tracking-wider font-sans font-medium">
              Model:
            </span>
            <span className="text-[var(--atelier-ink)] font-bold truncate max-w-[14rem]">
              {provider === 'google'
                ? settings.geminiModel || 'gemini-flash-latest'
                : settings.openRouterModel || 'OpenRouter model unset'}
            </span>
          </div>

          <div
            className="inline-flex p-1 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 shadow-[var(--atelier-shadow-sm)]"
            role="group"
            aria-label="Extraction model"
          >
            <button
              type="button"
              onClick={() => setProvider('google')}
              aria-pressed={provider === 'google'}
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
              aria-pressed={provider === 'openrouter'}
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
              aria-label="Sign out"
              className="inline-flex h-9 w-9 items-center justify-center border-l border-[var(--atelier-line)] text-[var(--atelier-faint)] hover:text-red-600"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="atelier-card mb-5 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setShowSettings((prev) => !prev)}
          aria-expanded={showSettings}
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

      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        <section className="xl:col-span-4 xl:sticky xl:top-28" aria-label="Invoice intake">
          <div className="atelier-card-lg p-4 sm:p-5 ledger-stack">
            <div
              {...getRootProps()}
              className={`rounded-2xl border border-dashed px-5 py-8 text-center transition cursor-pointer ${
                isDragActive
                  ? 'border-[var(--atelier-gold)] bg-[var(--atelier-gold-soft)]'
                  : 'border-[var(--atelier-line)] hover:border-[var(--atelier-gold)]/40'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-7 h-7 mx-auto mb-2.5 text-[var(--atelier-faint)]" />
              <p className="font-medium text-sm">{isDragActive ? 'Drop the invoice' : 'Drag in a PDF or photo'}</p>
              <p className="text-xs text-[var(--atelier-faint)] mt-1">
                PDF, PNG, JPG, WebP · paste with Ctrl/⌘ V
              </p>
            </div>

            <div className="ledger-field">
              <label className="atelier-label" htmlFor="operator-notes">Your notes (trusted)</label>
              <textarea
                id="operator-notes"
                value={extraDetails}
                onChange={(event) => setExtraDetails(event.target.value)}
                placeholder="Bank debit in INR, paid via IDFC WOW, this is the edudojo.ai domain…"
                className="atelier-input min-h-[100px] h-auto py-3 resize-y"
                aria-describedby="operator-notes-hint"
              />
              <p id="operator-notes-hint" className="text-xs text-[var(--atelier-faint)] leading-relaxed">
                Notes outrank the PDF. Ctrl/⌘ Enter extracts.
              </p>
            </div>

            {file && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--atelier-line)] px-3.5 py-2.5">
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

            {error && !extracted && (
              <div className="flex gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
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
              <img src={previewUrl} alt="Invoice preview" className="w-full h-auto max-h-[220px] object-contain rounded-2xl border border-[var(--atelier-line)] p-2" />
            )}
            {previewUrl && file && fileLooksLikePdf(file) && (
              <iframe title="Invoice PDF" src={previewUrl} className="w-full h-[220px] rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)]" />
            )}
          </div>
        </section>

        <section className="xl:col-span-8" aria-label="Ledger review">
          <div className="atelier-card-lg min-h-[420px] overflow-hidden">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--atelier-muted)]">
                <Loader2 className="w-7 h-7 animate-spin text-[var(--atelier-gold)]" />
                <p>Extracting and structuring ledger facts from invoice &amp; notes…</p>
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
                    <h2 ref={reviewHeadingRef} tabIndex={-1} className="text-sm font-semibold outline-none">
                      Review before Notion
                    </h2>
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

                <div className="p-5 sm:p-6 space-y-4">
                  {error && (
                    <div className="flex gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
                      <span className="inline-flex gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        {success}
                      </span>
                      <button type="button" onClick={resetInvoice} className="atelier-btn atelier-btn-ghost !py-1.5 !px-3">
                        Log another
                      </button>
                    </div>
                  )}
                  {(fusion || extracted.operatorOverrides?.length) && (
                    <p className="text-sm text-[var(--atelier-muted)] leading-relaxed px-0.5">
                      {fusion || extracted.sourceFusion}
                    </p>
                  )}
                  {reviewNotes.length > 0 && (
                    <ul className="text-sm text-amber-800 dark:text-amber-200 list-disc pl-5 space-y-1">
                      {reviewNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}

                  <FormSection title="What happened">
                    <div className="ledger-stack-grid xl:grid-cols-2">
                      <div className="ledger-field">
                        <FieldLabel htmlFor="transactionName" label="Transaction name" hint="Vendor / purpose — period" confidence={flags.transactionName} />
                        <input
                          required
                          id="transactionName"
                          name="transactionName"
                          value={extracted.transactionName || ''}
                          onChange={(event) => updateField('transactionName', event.target.value)}
                          className="atelier-input"
                        />
                      </div>
                      <div className="ledger-field">
                        <FieldLabel label="Business purpose" hint="One sentence for a CA" confidence={flags.businessPurpose} />
                        <input
                          name="businessPurpose"
                          value={extracted.businessPurpose || ''}
                          onChange={(event) => updateField('businessPurpose', event.target.value)}
                          className="atelier-input"
                        />
                      </div>
                      <div className="ledger-field xl:col-span-2">
                        <FieldLabel label="Notes" hint="FX, splits, extra context" confidence={flags.notes} />
                        <textarea
                          name="notes"
                          value={extracted.notes || ''}
                          onChange={(event) => updateField('notes', event.target.value)}
                          className="atelier-input"
                        />
                      </div>
                    </div>
                    <label className="mt-4 flex items-center gap-2 text-sm font-medium cursor-pointer">
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
                      <div className="mt-4 ledger-stack">
                        <div className="ledger-field max-w-xs">
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
                            <div className="grid grid-cols-6 xl:grid-cols-12 gap-1.5">
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
                                        : 'border-[var(--atelier-line)] text-[var(--atelier-faint)]'
                                    }`}
                                  >
                                    {month.slice(0, 3)}
                                  </button>
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
                  </FormSection>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormSection title="Money">
                      <div className="ledger-stack-grid sm:grid-cols-2">
                        <div className="ledger-field">
                          <FieldLabel htmlFor="amount" label="Amount INR" hint="Bank debit in rupees" confidence={flags.amount} />
                          <AmountStepper
                            name="amount"
                            value={extracted.amount}
                            onChange={(name, value) => updateField(name, Number(value) || 0)}
                            onAdjust={(name, delta) =>
                              updateField(name, Math.max(0, Number(((extracted[name] || 0) + delta).toFixed(2))))
                            }
                          />
                        </div>
                        <div className="ledger-field">
                          <FieldLabel label="Payment" hint="How it left the account" confidence={flags.paymentMode} />
                          <LedgerSelect name="paymentMode" value={extracted.paymentMode} options={PaymentModes} onChange={updateField} />
                        </div>
                        <div className="ledger-field">
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
                        <div className="ledger-field">
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
                      </div>
                      <div className="mt-4 flex flex-wrap gap-5 text-sm">
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
                    </FormSection>

                    <FormSection title="Books">
                      <div className="ledger-stack-grid sm:grid-cols-2">
                        <div className="ledger-field">
                          <FieldLabel htmlFor="type" label="Type" hint="Direction of funds" confidence={flags.type} />
                          <LedgerSelect name="type" value={extracted.type} options={Types} onChange={updateField} labelledBy="type-label" />
                        </div>
                        <div className="ledger-field">
                          <FieldLabel label="Category" hint="P&L bucket" confidence={flags.category} />
                          <LedgerSelect name="category" value={extracted.category} options={Categories} onChange={updateField} />
                        </div>
                        <div className="ledger-field">
                          <FieldLabel label="Tax class" hint="Deductibility" confidence={flags.taxClass} />
                          <LedgerSelect name="taxClass" value={extracted.taxClass} options={TaxClasses} onChange={updateField} />
                        </div>
                        <div className="ledger-field">
                          <FieldLabel label="Deal type" hint="Commercial shape" confidence={flags.dealType} />
                          <LedgerSelect name="dealType" value={extracted.dealType} options={DealTypes} onChange={updateField} />
                        </div>
                      </div>
                    </FormSection>
                  </div>

                  <FormSection title="Who and when">
                    <div className="ledger-stack-grid sm:grid-cols-2 xl:grid-cols-6">
                      <div className="ledger-field xl:col-span-2">
                        <FieldLabel label="Vendor" hint="Legal billing name" confidence={flags.vendor} />
                        <input
                          value={extracted.vendor || ''}
                          onChange={(event) => updateField('vendor', event.target.value)}
                          className="atelier-input"
                        />
                      </div>
                      <div className="ledger-field">
                        <FieldLabel label="Invoice #" hint="Vendor invoice id" confidence={flags.invoiceNumber} />
                        <input
                          value={extracted.invoiceNumber || ''}
                          onChange={(event) => updateField('invoiceNumber', event.target.value)}
                          className="atelier-input font-mono"
                        />
                      </div>
                      <div className="ledger-field">
                        <FieldLabel htmlFor="date" label="Date" hint="Invoice date" confidence={flags.date} />
                        <input
                          type="date"
                          id="date"
                          required
                          value={extracted.date || ''}
                          onChange={(event) => updateField('date', event.target.value)}
                          className="atelier-input"
                        />
                      </div>
                      <div className="ledger-field">
                        <FieldLabel label="FY" hint="Indian FY" confidence={flags.financialYear} />
                        <LedgerSelect
                          name="financialYear"
                          value={extracted.financialYear}
                          options={fyOptions}
                          onChange={updateField}
                        />
                      </div>
                      <div className="ledger-field">
                        <FieldLabel label="Month" hint="Calendar month" confidence={flags.month} />
                        <LedgerSelect name="month" value={extracted.month} options={[...Months]} onChange={updateField} />
                      </div>
                    </div>
                  </FormSection>

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
