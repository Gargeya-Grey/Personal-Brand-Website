'use client';

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import './article-expandable.css';

function ExpandButton({
  onClick,
  label,
  text,
}: {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  label: string;
  text?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`article-expand ${text ? 'article-expand--text' : 'absolute top-2.5 right-2.5 z-10'}`}
    >
      {text && <span>{text}</span>}
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="article-lightbox"
    >
      <div className="article-lightbox-panel">
        <div className="article-lightbox-header">
          <span className="article-lightbox-title">
            <Maximize2 aria-hidden="true" />
            {label}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="article-lightbox-close"
          >
            <span>Close</span>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="article-lightbox-body">{children}</div>
      </div>
    </dialog>
  );
}

export function ExpandableFrame({
  label,
  children,
  as = 'div',
  expandText,
  expandedContent,
}: {
  label: string;
  children: ReactElement;
  as?: 'div' | 'span';
  expandText?: string;
  expandedContent?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }));
  };

  const clone = isValidElement(children) ? cloneElement(children) : children;
  const Wrap = as;
  const expandButton = (
    <ExpandButton
      onClick={(event) => { openerRef.current = event.currentTarget; setOpen(true); }}
      label={`Expand ${label}`}
      text={expandText}
    />
  );

  return (
    <>
      <Wrap className={`group relative min-w-0 max-w-full ${as === 'span' ? 'inline-block' : 'block'}`}>
        {!expandText && expandButton}
        {children}
        {expandText && expandButton}
      </Wrap>
      {open
        ? createPortal(
            <Lightbox label={label} onClose={close}>
              {expandedContent ?? clone}
            </Lightbox>,
            document.body
          )
        : null}
    </>
  );
}
