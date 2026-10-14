'use client';

import './ledger.css';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type LedgerSelectProps = {
  name: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  labelledBy?: string;
};

export function LedgerSelect({
  name,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  labelledBy,
}: LedgerSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="ledger-select">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : name}
        onClick={() => setOpen((prev) => !prev)}
        className="atelier-input ledger-select-button"
      >
        <span className="ledger-select-value" data-empty={value ? undefined : 'true'}>
          {value || placeholder}
        </span>
        <ChevronDown className="ledger-select-chevron" aria-hidden />
      </button>
      {open && (
        <ul role="listbox" className="ledger-select-list">
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
                className="ledger-select-option"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
