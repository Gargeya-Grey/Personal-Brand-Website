'use client';

import './ledger.css';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { ChevronDown, ChevronUp, Loader2, LogOut, UploadCloud, X } from 'lucide-react';
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
import { extractPdfText, fileLooksLikePdf, renderPdfPreviewImage, validateInvoiceFile } from '@/lib/ledger-pdf-client';
import { harvestDocumentSignals } from '@/lib/ledger-parse';
import { LedgerSelect } from '@/components/ledger/ledger-select';

type ExtractResponse = {
  data: LedgerEntry;
  validation_errors?: string[];
  status?: string;
  fusion?: string;
  error?: string;
};

const FLOW_STEPS = ['Upload', 'Review', 'Notion'] as const;

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
  return (
    <div className="ledger-label-row">
      <label className="atelier-label" title={hint} htmlFor={htmlFor} id={htmlFor ? `${htmlFor}-label` : undefined}>
        {label}
      </label>
      {confidence && (
        <span className="ledger-conf" data-level={confidence.toLowerCase()}>
          {confidence.toLowerCase()}
        </span>
      )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ledger-group">
      <h3 className="atelier-h3">{title}</h3>
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
    <div className="ledger-amount">
      <input
        type="number"
        step="0.01"
        min="0"
        name={name}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(name, event.target.value)}
        className="atelier-input ledger-num"
        id={name}
        aria-labelledby={`${name}-label`}
      />
      <div className="ledger-amount-steps">
        {[-10, -1, 1, 10].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onAdjust(name, delta)}
            aria-label={`${delta > 0 ? 'Increase' : 'Decrease'} ${name} by ${Math.abs(delta)}`}
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

  const fileImportVersion = useRef(0);
  const onDrop = useCallback(async (accepted: File[]) => {
    const candidate = accepted[0];
    if (!candidate) return;
    const version = ++fileImportVersion.current;
    let next: File;
    let preview: string | null;
    try {
      next = await validateInvoiceFile(candidate);
      preview = fileLooksLikePdf(next) ? (await renderPdfPreviewImage(next))?.dataUrl || null : URL.createObjectURL(next);
    } catch (error) {
      if (version === fileImportVersion.current) setError(error instanceof Error ? error.message : 'Invalid invoice.');
      return;
    }
    if (version !== fileImportVersion.current) { if (preview) URL.revokeObjectURL(preview); return; }
    setFile(next);
    setExtracted(null);
    setSuccess(null);
    setError(null);
    setFusion(null);
    setSelectedMonths([]);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
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
    fileImportVersion.current += 1;
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

  const flowStage = success ? 2 : extracted ? 1 : 0;
  const activeModel =
    provider === 'google'
      ? settings.geminiModel || 'gemini-flash-latest'
      : settings.openRouterModel || 'OpenRouter model unset';

  return (
    <div className="atelier-page ledger-root">
      <header className="atelier-head">
        <div className="atelier-head-row ledger-head-row">
          <div className="atelier-meta">
            <span>Private</span>
            <span>Finance</span>
          </div>
          <div className="ledger-account">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarForSession(user)} alt="" width={28} height={28} />
            <span className="ledger-account-name">{user.name}</span>
            <Link href="/api/auth/logout" title="Sign out" aria-label="Sign out" className="atelier-icon-btn">
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <h1>
          Ledger. <em>Invoice to Notion, with your notes on top.</em>
        </h1>
        <p className="atelier-lead">
          Drop an invoice, add what only you know, review the fused row, save to Notion.
        </p>
        <ol className="process-path ledger-steps" aria-label="Ledger flow">
          {FLOW_STEPS.map((step, index) => (
            <li
              key={step}
              data-state={index < flowStage ? 'done' : index === flowStage ? 'current' : 'todo'}
              aria-current={index === flowStage ? 'step' : undefined}
            >
              {step}
            </li>
          ))}
        </ol>
      </header>

      <section className="ledger-setup" aria-label="Notion setup">
        <div className="ledger-setup-bar">
          <div className="ledger-setup-title">
            <h2 className="atelier-h3">Notion setup</h2>
            <span className="atelier-status" data-tone={settings.configured ? 'live' : 'warn'}>
              {settings.configured ? `Connected (${settings.source})` : 'Not connected'}
            </span>
            {settings.configured && settings.tokenHint && (
              <span className="atelier-mono">{settings.tokenHint}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            aria-expanded={showSettings}
            className="atelier-link"
          >
            {showSettings ? 'Hide setup' : 'Show setup'}
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {showSettings && (
          <div className="ledger-setup-body">
            <p className="ledger-hint ledger-span">
              Create a Notion internal integration, share your ledger database with it, then paste the token and the
              database ID from the URL. Keys are encrypted and stored for your Google account only. Forks can also set{' '}
              <code>NOTION_API_KEY</code> and <code>NOTION_DATABASE_ID</code>.
            </p>
            <div className="ledger-field">
              <label className="atelier-label" htmlFor="notion-token">
                Integration token
              </label>
              <input
                id="notion-token"
                type="password"
                autoComplete="off"
                value={notionToken}
                onChange={(event) => setNotionToken(event.target.value)}
                placeholder={settings.tokenHint || 'secret_… or ntn_…'}
                className="atelier-input ledger-num"
              />
            </div>
            <div className="ledger-field">
              <label className="atelier-label" htmlFor="notion-database">
                Database ID
              </label>
              <input
                id="notion-database"
                type="text"
                autoComplete="off"
                value={databaseId}
                onChange={(event) => setDatabaseId(event.target.value)}
                placeholder={settings.databaseIdHint || '32-character id from the Notion URL'}
                className="atelier-input ledger-num"
              />
            </div>
            {!settings.aiConfigured && (
              <p className="atelier-notice ledger-span" data-tone="warn" style={{ margin: 0 }}>
                No AI key is configured. Set GEMINI_API_KEY (default), or OPENROUTER_API_KEY and LEDGER_OPENROUTER_MODEL.
              </p>
            )}
            {settings.aiConfigured && (
              <p className="ledger-hint ledger-span">
                Gemini <span className="ledger-mono">{settings.geminiConfigured ? settings.geminiModel : 'not set'}</span>
                {' · '}
                OpenRouter <span className="ledger-mono">{settings.openRouterModel || 'not set'}</span> — change{' '}
                <code>LEDGER_OPENROUTER_MODEL</code> in .env, then restart the server.
              </p>
            )}
            {settingsMsg && (
              <p className="ledger-hint ledger-span" role="status">
                {settingsMsg}
              </p>
            )}
            <div className="ledger-setup-actions ledger-span">
              <button type="button" onClick={saveSettings} disabled={settingsBusy} className="atelier-btn atelier-btn-line">
                {settingsBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & test
              </button>
              {settings.source === 'user' && (
                <button type="button" onClick={clearSettings} disabled={settingsBusy} className="atelier-btn atelier-btn-danger">
                  Clear my keys
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <div className="ledger-work">
        <section className="ledger-intake" aria-label="Invoice intake">
          <div className="ledger-section-head">
            <h2>
              Upload <em>Invoice and notes.</em>
            </h2>
          </div>
          <div className="ledger-stack">
            <div {...getRootProps()} className="ledger-drop" data-drag={isDragActive ? 'true' : undefined}>
              <input {...getInputProps()} />
              <UploadCloud aria-hidden />
              <p className="ledger-drop-title">{isDragActive ? 'Drop the invoice' : 'Drag in a PDF or photo'}</p>
              <p className="ledger-drop-types">PDF · PNG · JPG · WebP</p>
              <p className="ledger-drop-paste">or paste with Ctrl/⌘ V</p>
            </div>

            {file && (
              <div className="ledger-file">
                <div className="min-w-0">
                  <p className="ledger-file-name">{file.name}</p>
                  <p className="ledger-file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  className="atelier-icon-btn"
                  onClick={() => {
                    fileImportVersion.current += 1;
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

            <div className="ledger-field">
              <label className="atelier-label" htmlFor="operator-notes">
                Your notes (trusted)
              </label>
              <textarea
                id="operator-notes"
                value={extraDetails}
                onChange={(event) => setExtraDetails(event.target.value)}
                placeholder="Bank debit in INR, paid via IDFC WOW, this is the edudojo.ai domain…"
                className="atelier-input"
                aria-describedby="operator-notes-hint"
              />
              <p id="operator-notes-hint" className="ledger-hint">
                Notes outrank the invoice when they conflict. Ctrl/⌘ Enter extracts.
              </p>
            </div>

            <div className="ledger-field">
              <span className="atelier-label" id="ledger-provider-label">
                Extraction model
              </span>
              <div className="ledger-provider" role="group" aria-labelledby="ledger-provider-label">
                <button
                  type="button"
                  onClick={() => setProvider('google')}
                  aria-pressed={provider === 'google'}
                  className="atelier-chip"
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
                  className="atelier-chip"
                >
                  OpenRouter
                </button>
                <span
                  className="ledger-model"
                  title={`Active ${provider === 'google' ? 'GEMINI_MODEL' : 'LEDGER_OPENROUTER_MODEL'} environment variable`}
                >
                  {activeModel}
                </span>
              </div>
            </div>

            {error && !extracted && (
              <div className="atelier-notice" data-tone="warn" role="alert">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || (!file && !extraDetails.trim())}
              className={`atelier-btn w-full h-11! ${extracted ? 'atelier-btn-line' : 'atelier-btn-primary'}`}
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isExtracting ? 'Reading invoice + notes…' : 'Extract with notes'}
            </button>

            {previewUrl && file && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Invoice preview" className="ledger-preview" />
            )}
          </div>
        </section>

        <section aria-label="Ledger review">
          <div className="ledger-section-head">
            <h2>
              Review{' '}
              <em>
                {isExtracting
                  ? 'Extracting and structuring ledger facts from invoice & notes…'
                  : !extracted
                    ? 'Extract an invoice to review the ledger row here.'
                    : 'Low-confidence fields are flagged. Edit anything.'}
              </em>
            </h2>
          </div>
          {isExtracting ? (
            <div className="ledger-empty" aria-busy="true">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              <p>Extracting…</p>
            </div>
          ) : !extracted ? (
            <div className="ledger-empty" />
          ) : (
            <form onSubmit={handleSave}>
              <div className="atelier-toolbar ledger-review-bar">
                <h3 ref={reviewHeadingRef} tabIndex={-1} className="ledger-review-title">
                  Review before Notion
                </h3>
                <button type="submit" disabled={isSaving || !settings.configured} className="atelier-btn atelier-btn-primary">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {extracted.isSubscription &&
                  extracted.subscriptionFrequency === 'Monthly' &&
                  selectedMonths.length > 1
                    ? `Save ${selectedMonths.length} rows`
                    : 'Save to Notion'}
                </button>
              </div>

              {(error || success || fusion || extracted.operatorOverrides?.length || reviewNotes.length > 0) && (
                <div className="ledger-messages">
                  {error && (
                    <div className="atelier-notice" data-tone="warn" role="alert">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="atelier-notice ledger-notice-row" data-tone="ok">
                      <span>{success}</span>
                      <button type="button" onClick={resetInvoice} className="atelier-link ledger-notice-action">
                        Log another
                      </button>
                    </div>
                  )}
                  {(fusion || extracted.operatorOverrides?.length) && (
                    <p className="ledger-fusion">{fusion || extracted.sourceFusion}</p>
                  )}
                  {reviewNotes.length > 0 && (
                    <div className="atelier-notice" data-tone="warn">
                      <ul>
                        {reviewNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <FormSection title="What happened">
                <div className="ledger-grid">
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
                    <FieldLabel htmlFor="businessPurpose" label="Business purpose" hint="One sentence for a CA" confidence={flags.businessPurpose} />
                    <input
                      id="businessPurpose"
                      name="businessPurpose"
                      value={extracted.businessPurpose || ''}
                      onChange={(event) => updateField('businessPurpose', event.target.value)}
                      className="atelier-input"
                    />
                  </div>
                  <div className="ledger-field ledger-span">
                    <FieldLabel htmlFor="notes" label="Notes" hint="FX, splits, extra context" confidence={flags.notes} />
                    <textarea
                      id="notes"
                      name="notes"
                      value={extracted.notes || ''}
                      onChange={(event) => updateField('notes', event.target.value)}
                      className="atelier-input"
                    />
                  </div>
                </div>
                <div className="ledger-checks">
                  <label className="ledger-check">
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
                </div>
                {extracted.isSubscription && (
                  <div className="ledger-stack" style={{ marginTop: 20 }}>
                    <div className="ledger-field" style={{ maxWidth: '20rem' }}>
                      <FieldLabel htmlFor="subscriptionFrequency" label="Billing cycle" hint="Monthly creates one Notion row per selected month" />
                      <LedgerSelect
                        name="subscriptionFrequency"
                        value={extracted.subscriptionFrequency || 'Monthly'}
                        options={['Monthly', 'Yearly', 'One-time']}
                        onChange={updateField}
                        labelledBy="subscriptionFrequency-label"
                      />
                    </div>
                    {extracted.subscriptionFrequency === 'Monthly' && (
                      <>
                        <div className="ledger-field">
                          <div className="ledger-months-head">
                            <span className="atelier-label" id="ledger-months-label">
                              Months this FY
                            </span>
                            <span className="ledger-months-tools">
                              <button type="button" className="atelier-link" onClick={() => setSelectedMonths([...Months])}>
                                All 12
                              </button>
                              <button
                                type="button"
                                className="atelier-link"
                                onClick={() => {
                                  const idx = Months.indexOf(extracted.month as (typeof Months)[number]);
                                  setSelectedMonths(idx >= 0 ? Months.slice(0, idx + 1) : [extracted.month]);
                                }}
                              >
                                Up to {extracted.month}
                              </button>
                              <button type="button" className="atelier-link" onClick={() => setSelectedMonths([])}>
                                Clear
                              </button>
                            </span>
                          </div>
                          <div className="ledger-months" role="group" aria-labelledby="ledger-months-label">
                            {Months.map((month) => {
                              const on = selectedMonths.includes(month);
                              return (
                                <button
                                  key={month}
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() =>
                                    setSelectedMonths((prev) =>
                                      prev.includes(month) ? prev.filter((item) => item !== month) : [...prev, month]
                                    )
                                  }
                                  className="atelier-chip"
                                >
                                  {month.slice(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {truncationWarning && (
                          <p className="ledger-warn">
                            Billing day {originalDay} does not exist in some months, so those dates clamp to the last valid day.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </FormSection>

              <FormSection title="Money">
                <div className="ledger-grid">
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
                    <FieldLabel htmlFor="paymentMode" label="Payment" hint="How it left the account" confidence={flags.paymentMode} />
                    <LedgerSelect name="paymentMode" value={extracted.paymentMode} options={PaymentModes} onChange={updateField} labelledBy="paymentMode-label" />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="netAmount" label="Net" hint="Ex-GST" confidence={flags.netAmount} />
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
                    <FieldLabel htmlFor="gstAmount" label="GST" hint="Tax component" confidence={flags.gstAmount} />
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
                <div className="ledger-checks">
                  <label className="ledger-check">
                    <input
                      type="checkbox"
                      checked={!!extracted.idfcWowCard}
                      onChange={(event) => updateField('idfcWowCard', event.target.checked)}
                    />
                    IDFC WOW card
                  </label>
                  <label className="ledger-check">
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
                <div className="ledger-grid">
                  <div className="ledger-field">
                    <FieldLabel htmlFor="type" label="Type" hint="Direction of funds" confidence={flags.type} />
                    <LedgerSelect name="type" value={extracted.type} options={Types} onChange={updateField} labelledBy="type-label" />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="category" label="Category" hint="P&L bucket" confidence={flags.category} />
                    <LedgerSelect name="category" value={extracted.category} options={Categories} onChange={updateField} labelledBy="category-label" />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="taxClass" label="Tax class" hint="Deductibility" confidence={flags.taxClass} />
                    <LedgerSelect name="taxClass" value={extracted.taxClass} options={TaxClasses} onChange={updateField} labelledBy="taxClass-label" />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="dealType" label="Deal type" hint="Commercial shape" confidence={flags.dealType} />
                    <LedgerSelect name="dealType" value={extracted.dealType} options={DealTypes} onChange={updateField} labelledBy="dealType-label" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Who and when">
                <div className="ledger-grid">
                  <div className="ledger-field ledger-span">
                    <FieldLabel htmlFor="vendor" label="Vendor" hint="Legal billing name" confidence={flags.vendor} />
                    <input
                      id="vendor"
                      value={extracted.vendor || ''}
                      onChange={(event) => updateField('vendor', event.target.value)}
                      className="atelier-input"
                    />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="invoiceNumber" label="Invoice #" hint="Vendor invoice id" confidence={flags.invoiceNumber} />
                    <input
                      id="invoiceNumber"
                      value={extracted.invoiceNumber || ''}
                      onChange={(event) => updateField('invoiceNumber', event.target.value)}
                      className="atelier-input ledger-num"
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
                      className="atelier-input ledger-num"
                    />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="financialYear" label="FY" hint="Indian FY" confidence={flags.financialYear} />
                    <LedgerSelect
                      name="financialYear"
                      value={extracted.financialYear}
                      options={fyOptions}
                      onChange={updateField}
                      labelledBy="financialYear-label"
                    />
                  </div>
                  <div className="ledger-field">
                    <FieldLabel htmlFor="month" label="Month" hint="Calendar month" confidence={flags.month} />
                    <LedgerSelect name="month" value={extracted.month} options={[...Months]} onChange={updateField} labelledBy="month-label" />
                  </div>
                </div>
              </FormSection>

              {extracted.chainOfThought && (
                <div className="ledger-audit">
                  <button type="button" onClick={() => setShowAudit((prev) => !prev)} className="atelier-link" aria-expanded={showAudit}>
                    Audit trail {showAudit ? '▾' : '▸'}
                  </button>
                  {showAudit && <pre>{extracted.chainOfThought}</pre>}
                </div>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
