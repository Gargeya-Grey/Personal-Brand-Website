'use client';

import './ai-model-control.css';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  EFFORT_LABELS,
  REASONING_EFFORTS,
  aiChoiceStorageKey,
  aiModelRequest,
  normalizeEffort,
  normalizeModelSlug,
  type AiModelProvider,
  type AiModelRequest,
  type AiSurface,
  type ReasoningEffort,
} from '@/lib/ai-model-options';

/** What the browser remembers for one surface and provider. */
type StoredChoice = { model: string; effort: ReasoningEffort };

const EMPTY_CHOICE: StoredChoice = { model: '', effort: 'default' };
const MAX_INPUT_LENGTH = 160;
const MODELS_URL = 'https://openrouter.ai/models';

/*
 * The choice lives in localStorage and is read through useSyncExternalStore. React uses the empty
 * server snapshot while it hydrates, then re-reads the real value, so the markup never mismatches.
 * When storage throws (private window, blocked site data), the choice lives in memory for the visit.
 */
const memoryStore = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return memoryStore.get(key) ?? '';
  }
}

function writeChoice(key: string, next: StoredChoice) {
  const isEmpty = next.model === '' && next.effort === 'default';
  try {
    if (isEmpty) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    if (isEmpty) memoryStore.delete(key);
    else memoryStore.set(key, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getServerSnapshot() {
  return '';
}

function parseChoice(raw: string): StoredChoice {
  if (!raw) return EMPTY_CHOICE;
  try {
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object') {
      const { model, effort } = value as { model?: unknown; effort?: unknown };
      return {
        model: typeof model === 'string' ? model.slice(0, MAX_INPUT_LENGTH) : '',
        effort: normalizeEffort(effort),
      };
    }
  } catch {
    // Garbage in storage: fall through to the defaults.
  }
  return EMPTY_CHOICE;
}

export type AiModelChoice = {
  model: string;
  effort: ReasoningEffort;
  setModel: (model: string) => void;
  setEffort: (effort: ReasoningEffort) => void;
  reset: () => void;
  /** The request fields: no `model` for an empty or invalid slug, no `effort` for "default" or a non-OpenRouter provider. */
  request: AiModelRequest;
};

/** The remembered model and effort for one AI surface. Switching `provider` loads that provider's own choice. */
export function useAiModelChoice(surface: AiSurface, provider: AiModelProvider = 'openrouter'): AiModelChoice {
  const key = aiChoiceStorageKey(surface, provider);
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), getServerSnapshot);
  const { model, effort } = useMemo(() => parseChoice(raw), [raw]);

  const setModel = useCallback(
    (next: string) => {
      writeChoice(key, { model: next.slice(0, MAX_INPUT_LENGTH), effort: parseChoice(readRaw(key)).effort });
    },
    [key]
  );
  const setEffort = useCallback(
    (next: ReasoningEffort) => {
      writeChoice(key, { model: parseChoice(readRaw(key)).model, effort: next });
    },
    [key]
  );
  const reset = useCallback(() => writeChoice(key, EMPTY_CHOICE), [key]);

  const request = useMemo(
    () => aiModelRequest(model, provider === 'openrouter' ? effort : 'default'),
    [model, effort, provider]
  );

  return { model, effort, setModel, setEffort, reset, request };
}

interface AiModelControlProps {
  choice: AiModelChoice;
  /** The .env model. Null when the server has none either. */
  defaultModel: string | null;
  /** Makes the element ids unique when several controls share a page. */
  idPrefix: string;
  provider?: AiModelProvider;
  /** The effort menu. Defaults to on for OpenRouter and off for Google. */
  showEffort?: boolean;
  label?: string;
}

/** One line that names the model, and a small editor behind "Change". */
export function AiModelControl({
  choice,
  defaultModel,
  idPrefix,
  provider = 'openrouter',
  showEffort,
  label = 'Model',
}: AiModelControlProps) {
  const { model, effort, setModel, setEffort, reset } = choice;
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const effortVisible = showEffort ?? provider === 'openrouter';
  const chosenSlug = normalizeModelSlug(model);
  const hasInvalidSlug = model.trim() !== '' && chosenSlug === null;
  const hasChoice = model !== '' || effort !== 'default';

  const slugId = `${idPrefix}-slug`;
  const effortId = `${idPrefix}-effort`;
  const hintId = `${idPrefix}-hint`;
  const noteId = `${idPrefix}-note`;
  const editorId = `${idPrefix}-editor`;

  const slugText = chosenSlug ?? defaultModel;

  return (
    <div className="ai-model">
      <div className="ai-model-summary">
        <span className="atelier-label ai-model-label">{label}</span>
        <span className="ai-model-value">
          {slugText ? (
            <>
              <span className="atelier-mono ai-model-slug">{slugText}</span>
              {!chosenSlug && <span className="ai-model-default"> (default)</span>}
            </>
          ) : (
            <span className="ai-model-default">Not set</span>
          )}
        </span>
        {effortVisible && <span className="ai-model-effort">Effort: {EFFORT_LABELS[effort]}</span>}
        <button
          type="button"
          className="atelier-link ai-model-toggle"
          aria-expanded={open}
          aria-controls={editorId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Done' : 'Change'}
        </button>
      </div>

      {hasInvalidSlug && (
        <p id={noteId} className="ai-model-note">
          Not a valid slug. The default model will be used.
        </p>
      )}

      {open && (
        <div id={editorId} className="ai-model-editor">
          <div className="ai-model-fields" data-effort={effortVisible}>
            <div className="ai-model-field">
              <label className="atelier-label" htmlFor={slugId}>
                Model slug
              </label>
              <input
                ref={inputRef}
                id={slugId}
                type="text"
                className="atelier-input ai-model-input"
                value={model}
                maxLength={MAX_INPUT_LENGTH}
                onChange={(event) => setModel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setOpen(false);
                  }
                }}
                placeholder={defaultModel || 'vendor/model-name'}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                aria-invalid={hasInvalidSlug || undefined}
                aria-describedby={hasInvalidSlug ? `${hintId} ${noteId}` : hintId}
              />
            </div>
            {effortVisible && (
              <div className="ai-model-field">
                <label className="atelier-label" htmlFor={effortId}>
                  Reasoning effort
                </label>
                <select
                  id={effortId}
                  className="atelier-input ai-model-select"
                  value={effort}
                  onChange={(event) => setEffort(normalizeEffort(event.target.value))}
                >
                  {REASONING_EFFORTS.map((level) => (
                    <option key={level} value={level}>
                      {EFFORT_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="ai-model-foot">
            <button type="button" className="atelier-link" onClick={reset} disabled={!hasChoice}>
              Use default
            </button>
            <p id={hintId} className="ai-model-hint">
              Remembered in this browser. Empty uses the .env model.
              {provider === 'openrouter' && (
                <>
                  {' '}
                  <a className="atelier-link ai-model-browse" href={MODELS_URL} target="_blank" rel="noopener noreferrer">
                    Browse models
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
