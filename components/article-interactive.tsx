'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Square, SlidersHorizontal } from 'lucide-react';
import { buildInteractiveDocument } from '@/lib/article-interactive-document';
import { pickArticleFontFaces, primaryFamily } from '@/lib/article-interactive-fonts';
import type { FontDescriptors, FontFaceRuleInfo, LoadedFontInfo } from '@/lib/article-interactive-fonts';
import './article-interactive.css';

type FrameFont = { family: string; source: ArrayBuffer; descriptors: FontDescriptors };

let articleFonts: Promise<FrameFont[]> | null = null;

/** Reads the font files the page already loaded, once, so frames can use them without a font-src policy. */
function collectArticleFonts() {
  articleFonts ??= (async () => {
    try {
      const pageStyle = getComputedStyle(document.documentElement);
      const families = ['--font-body', '--font-reading', '--font-mono']
        .map((name) => primaryFamily(pageStyle.getPropertyValue(name)))
        .filter(Boolean);
      const rules: FontFaceRuleInfo[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (!(rule instanceof CSSFontFaceRule)) continue;
            const read = (property: string) => rule.style.getPropertyValue(property).trim();
            rules.push({
              family: read('font-family'), src: read('src'), sheetHref: sheet.href ?? document.baseURI,
              weight: read('font-weight'), style: read('font-style'),
              unicodeRange: read('unicode-range'), stretch: read('font-stretch'),
            });
          }
        } catch {
          // Cross-origin stylesheets cannot be read; their fonts are not sent.
        }
      }
      const loaded: LoadedFontInfo[] = [];
      document.fonts.forEach((face) => {
        if (face.status === 'loaded') {
          loaded.push({ family: face.family, weight: face.weight, style: face.style, unicodeRange: face.unicodeRange });
        }
      });
      const faces = pickArticleFontFaces({ families, origin: window.location.origin, rules, loaded });
      const fonts = await Promise.all(faces.map(async ({ family, url, descriptors }) => {
        try {
          const response = await fetch(url);
          return response.ok ? { family, source: await response.arrayBuffer(), descriptors } : null;
        } catch {
          return null;
        }
      }));
      return fonts.filter((font): font is FrameFont => font !== null);
    } catch {
      return [];
    }
  })();
  return articleFonts;
}

export function ArticleInteractive({ source, title, description, height }: {
  source: string;
  title: string;
  description: string;
  height: number;
}) {
  const id = useId();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const focusFrameOnLoad = useRef(false);
  const [running, setRunning] = useState(false);
  const [revision, setRevision] = useState(0);
  const [frameHeight, setFrameHeight] = useState(height);
  const document = useMemo(() => buildInteractiveDocument(source, title, id), [source, title, id]);

  useEffect(() => {
    if (!running) return;
    const frame = frameRef.current;
    if (!frame) return;
    const root = window.document.documentElement;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
    const syncPreferences = () => frame.contentWindow?.postMessage({
      type: 'article-interactive:preferences', id,
      theme: root.classList.contains('dark') ? 'dark' : 'light',
      reducedMotion: motionQuery.matches,
      paused: !inView || window.document.hidden,
    }, '*');
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.data?.id !== id) return;
      if (event.data.type === 'article-interactive:ready') {
        collectArticleFonts()
          .catch(() => [] as FrameFont[])
          .then((fonts) => frame.contentWindow?.postMessage({ type: 'article-interactive:fonts', id, fonts }, '*'));
        return;
      }
      if (event.data.type !== 'article-interactive:resize') return;
      const nextHeight = event.data.height;
      if (typeof nextHeight === 'number' && Number.isFinite(nextHeight)) {
        setFrameHeight(Math.max(160, Math.min(1600, Math.ceil(nextHeight))));
      }
    };
    const themeObserver = new MutationObserver(syncPreferences);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPreferences();
    });
    visibilityObserver.observe(frame);
    window.addEventListener('message', receive);
    window.document.addEventListener('visibilitychange', syncPreferences);
    motionQuery.addEventListener('change', syncPreferences);
    frame.addEventListener('load', syncPreferences);
    syncPreferences();
    return () => {
      themeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('message', receive);
      window.document.removeEventListener('visibilitychange', syncPreferences);
      motionQuery.removeEventListener('change', syncPreferences);
      frame.removeEventListener('load', syncPreferences);
    };
  }, [id, running, revision, document]);

  return (
    <figure className="article-interactive" aria-labelledby={`${id}-title`}>
      <figcaption className="article-interactive-heading">
        <div className="article-interactive-label"><SlidersHorizontal size={14} aria-hidden="true" /> Interactive</div>
        <div id={`${id}-title`} className="article-interactive-title">{title}</div>
        {description && <p className="article-interactive-description">{description}</p>}
      </figcaption>
      {running ? (
        <>
          <div className="article-interactive-controls">
            <span>Try it for yourself</span>
            <button type="button" onClick={() => { setFrameHeight(height); setRevision((value) => value + 1); }} aria-label={`Reset ${title}`}><RotateCcw size={14} aria-hidden="true" /> Reset</button>
            <button type="button" onClick={() => {
              setRunning(false);
              requestAnimationFrame(() => runButtonRef.current?.focus());
            }} aria-label={`Stop ${title}`}><Square size={13} aria-hidden="true" /> Stop</button>
          </div>
          <iframe
            key={revision}
            ref={frameRef}
            title={title}
            srcDoc={document}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            allow="camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'"
            className="article-interactive-frame"
            style={{ height: frameHeight }}
            onLoad={() => {
              if (focusFrameOnLoad.current) {
                frameRef.current?.focus({ preventScroll: true });
                focusFrameOnLoad.current = false;
              }
            }}
          />
        </>
      ) : (
        <div className="article-interactive-start">
          <div className="article-interactive-motif" aria-hidden="true"><i /><i /><i /><span /></div>
          <button ref={runButtonRef} type="button" onClick={() => { focusFrameOnLoad.current = true; setFrameHeight(height); setRunning(true); }}>
            <Play size={16} aria-hidden="true" /> Run interactive
          </button>
          <span>Change something. See what happens.</span>
        </div>
      )}
      <noscript><p className="article-interactive-description">Enable JavaScript to explore this interactive.</p></noscript>
    </figure>
  );
}
