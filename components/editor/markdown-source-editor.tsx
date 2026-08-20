'use client';

import { useMemo, type ClipboardEvent, type KeyboardEvent, type UIEvent } from 'react';
import { highlightMarkdownSource } from '@/lib/markdown-source-highlight';

const sharedType =
  'font-mono text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] [tab-size:4]';

interface MarkdownSourceEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}

/**
 * Transparent textarea over a source-faithful highlight layer.
 * Markdown marks stay visible; emphasis/headings/links are styled in place.
 */
export function MarkdownSourceEditor({
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  required,
}: MarkdownSourceEditorProps) {
  const highlighted = useMemo(() => highlightMarkdownSource(value), [value]);

  const syncScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    const layer = e.currentTarget.previousElementSibling as HTMLElement | null;
    if (!layer) return;
    layer.scrollTop = e.currentTarget.scrollTop;
    layer.scrollLeft = e.currentTarget.scrollLeft;
  };

  return (
    <div className="relative min-h-[260px] w-full flex-grow sm:min-h-[360px]">
      <pre
        aria-hidden
        className={`md-source-highlight pointer-events-none absolute inset-0 m-0 overflow-auto p-0 ${sharedType} text-[var(--atelier-ink)]`}
      >
        {highlighted}
        {'\n'}
      </pre>
      <textarea
        data-atelier-editor
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck
        className={`md-source-textarea absolute inset-0 min-h-0 w-full resize-none overflow-auto border-0 bg-transparent p-0 caret-[var(--atelier-ink)] ${sharedType} text-transparent placeholder:text-[var(--atelier-faint)] focus:outline-none`}
      />
    </div>
  );
}
