'use client';

import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import './article-expandable.css';

function ExpandButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="article-expand absolute top-2.5 right-2.5 z-10"
    >
      <Maximize2 strokeWidth={2.25} />
    </button>
  );
}

function Lightbox({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-2.5 dark:border-white/10">
          <span className="font-label text-[0.65rem] uppercase tracking-[0.14em] text-slate-400">
            {label}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function ExpandableFrame({
  label,
  children,
  as = 'div',
}: {
  label: string;
  children: ReactElement;
  as?: 'div' | 'span';
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clone = isValidElement(children) ? cloneElement(children) : children;
  const Wrap = as;

  return (
    <>
      <Wrap className={`group relative ${as === 'span' ? 'inline-block max-w-full' : 'block'}`}>
        <ExpandButton onClick={() => setOpen(true)} label={`Expand ${label}`} />
        {children}
      </Wrap>
      {open && mounted
        ? createPortal(
            <Lightbox label={label} onClose={() => setOpen(false)}>
              {clone}
            </Lightbox>,
            document.body
          )
        : null}
    </>
  );
}
