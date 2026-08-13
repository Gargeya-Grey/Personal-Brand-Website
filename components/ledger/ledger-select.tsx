'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type LedgerSelectProps = {
  name: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
};

export function LedgerSelect({
  name,
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: LedgerSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="atelier-input flex items-center justify-between text-left"
      >
        <span className={value ? '' : 'text-[var(--atelier-faint)]'}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-card)] py-1 shadow-[var(--atelier-shadow)]"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(name, option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm text-left ${
                  value === option
                    ? 'bg-[var(--atelier-gold-soft)] text-[var(--atelier-ink)] font-semibold'
                    : 'text-[var(--atelier-muted)] hover:bg-[var(--atelier-paper)] hover:text-[var(--atelier-ink)]'
                }`}
              >
                <span>{option}</span>
                {value === option && <Check className="w-3.5 h-3.5 text-[var(--atelier-gold)]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
