'use client';

import { useEffect, useRef } from 'react';
import {
  WORD_ALPHA_LEVELS,
  WORD_POINTER_PUSH,
  WORD_POINTER_RADIUS,
  buildWordDots,
  gatherEase,
  hashText,
  inkedPixels,
  pointerPush,
  sampleWord,
  waveOffset,
  waveParams,
  wordAlpha,
  wordSpacing,
  type WaveParams,
  type WordDots,
} from '@/lib/stipple';
import './dot-wordmark.css';

/*
 * A word drawn in dots, for the footer. Same technique as InkWord: the span keeps the real text (the
 * server renders it solid, so there is no blank frame before hydration or without JavaScript); an
 * aria-hidden canvas over it draws the word with the span's own computed font as a mask, sampling the
 * dots on a jittered grid. Only after the first canvas frame does the text turn transparent (still
 * selectable and read by screen readers).
 *
 * The dots gather once, when the word first scrolls into view (from a loose scatter, mostly below, left
 * to right, about 1.6s). Then a slight, slow wave runs through them in a loop, and on a fine pointer
 * they give way a few px around the cursor and ease back. Everything pauses when the word is off
 * screen or the tab is hidden. Under reduced motion the word is gathered and still.
 */

/** Room around the word for the scattered start of the gather. */
const PAD_X = 40;
const PAD_Y = 70;
/** The word is redrawn about 30 times a second: the wave is slow, and half the frames are half the cost. */
const FRAME_MS = 30;
/** How fast a dot follows the pointer's push and returns, per drawn frame. */
const PUSH_EASE = 0.18;
/** The gather starts when this much of the word is on screen. */
const REVEAL_RATIO = 0.25;
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_QUERY = '(hover: hover) and (pointer: fine)';

/** `accentTail`: how many trailing characters are drawn in leaf green (the full stop in "Gargeya."). */
export function DotWordmark({ text, accentTail = 0 }: { text: string; accentTail?: number }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext('2d');
    // No canvas (old browser, test DOM) or no canvas letter spacing (the mask would drift off the
    // letters): keep the solid text, which is already right.
    if (!ctx || !('letterSpacing' in ctx)) return;
    const mask = document.createElement('canvas');
    const maskCtx = mask.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) return;

    const reducedQuery = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_QUERY) : null;
    const fineQuery = typeof window.matchMedia === 'function' ? window.matchMedia(FINE_QUERY) : null;
    let reduced = reducedQuery?.matches ?? false;
    let ink = '#14201c';
    let leaf = '#10b981';
    let dots: WordDots | null = null;
    let wave: WaveParams = waveParams(100);
    // Per-dot offset from the pointer's push, eased.
    let pushX = new Float32Array(0);
    let pushY = new Float32Array(0);
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    let sizeKey = '';
    let clock = 0;
    let last = 0;
    let lastDraw = 0;
    let frame = 0;
    let ready = false;
    let revealed = false;
    let visible = false;
    let ratio = 0;
    let disposed = false;
    let settled = false;
    let gatherStart = 0;
    let pointerX = -1e4;
    let pointerY = -1e4;
    let disturbed = false;
    let listening = false;
    const scratch = new Float32Array(2);

    const readPalette = () => {
      const css = getComputedStyle(root);
      // Read the --ink token, not `color`: the footer's colour transitions with the theme, so `color`
      // still holds the old ink when the theme class changes. Custom properties do not transition.
      ink = css.getPropertyValue('--ink').trim() || css.color || ink;
      leaf = css.getPropertyValue('--leaf').trim() || leaf;
    };

    /** Measures the span and rebuilds the canvases and dots when its size, font or pixel ratio changed. */
    const measure = (): boolean => {
      const css = getComputedStyle(root);
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      const fontPx = parseFloat(css.fontSize) || 16;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
      const letterSpacing = css.letterSpacing === 'normal' ? '0px' : css.letterSpacing;
      const key = `${rect.width.toFixed(2)}|${rect.height.toFixed(2)}|${font}|${letterSpacing}|${dpr}`;
      if (key === sizeKey) return true;
      sizeKey = key;

      cssW = Math.ceil(rect.width + PAD_X * 2 + 1);
      cssH = Math.ceil(rect.height + PAD_Y * 2 + 1);
      canvas.style.left = `${-PAD_X}px`;
      canvas.style.top = `${-PAD_Y}px`;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      // The mask is 1 px per CSS px: the dots are 2.6px apart, so a finer mask would only cost time.
      mask.width = cssW;
      mask.height = cssH;
      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, cssW, cssH);
      maskCtx.font = font;
      maskCtx.letterSpacing = letterSpacing;
      const m = maskCtx.measureText(text);
      const ascent = m.fontBoundingBoxAscent;
      const descent = m.fontBoundingBoxDescent;
      // The inline box is the font's ascent plus descent; centre on it in case the two disagree.
      const baseline = PAD_Y + (rect.height - (ascent + descent)) / 2 + ascent;
      maskCtx.fillStyle = '#000';
      maskCtx.fillText(text, PAD_X, baseline);

      const image = maskCtx.getImageData(0, 0, cssW, cssH);
      const spacing = wordSpacing(inkedPixels(image.data, cssW, cssH));
      const seed = hashText(text);
      // The last `accentTail` characters are drawn in leaf: they start right of the rest's ink.
      const accentFromX =
        accentTail > 0
          ? PAD_X + maskCtx.measureText(text.slice(0, -accentTail)).actualBoundingBoxRight + 1
          : Infinity;
      dots = buildWordDots(sampleWord(image.data, cssW, cssH, spacing, seed), cssW, seed, accentFromX);
      wave = waveParams(fontPx);
      pushX = new Float32Array(dots.count);
      pushY = new Float32Array(dots.count);
      disturbed = false;
      return true;
    };

    /** One frame: every dot placed (gather, wave, push) and drawn, batched by opacity level. */
    const draw = () => {
      const d = dots;
      if (!d) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const still = reduced;
      const gather = clock - gatherStart;
      const arrived = settled || still;
      // The pointer only matters while it is near the word.
      let pointerCx = 0;
      let pointerCy = 0;
      let active = false;
      if (!still && pointerX > -1e3) {
        const rect = canvas.getBoundingClientRect();
        pointerCx = pointerX - rect.left;
        pointerCy = pointerY - rect.top;
        active =
          pointerCx > -WORD_POINTER_RADIUS && pointerCx < cssW + WORD_POINTER_RADIUS &&
          pointerCy > -WORD_POINTER_RADIUS && pointerCy < cssH + WORD_POINTER_RADIUS;
      }
      const moving = active || disturbed;
      let largest = 0;
      for (let g = 0; g <= WORD_ALPHA_LEVELS; g++) {
        const from = d.start[g];
        const to = d.start[g + 1];
        if (to <= from) continue;
        ctx.fillStyle = g === WORD_ALPHA_LEVELS ? leaf : ink;
        ctx.globalAlpha = wordAlpha(g);
        ctx.beginPath();
        for (let i = from; i < to; i++) {
          const e = arrived ? 1 : gatherEase(gather - d.delay[i]);
          const restX = d.x[i];
          let restY = d.y[i];
          if (!still) restY += waveOffset(restX, clock, wave) * e;
          let x = restX;
          let y = restY;
          if (moving) {
            let tx = 0;
            let ty = 0;
            if (active) {
              pointerPush(restX - pointerCx, restY - pointerCy, WORD_POINTER_RADIUS, WORD_POINTER_PUSH, scratch);
              tx = scratch[0];
              ty = scratch[1];
            }
            const px = pushX[i] + (tx - pushX[i]) * PUSH_EASE;
            const py = pushY[i] + (ty - pushY[i]) * PUSH_EASE;
            pushX[i] = px;
            pushY[i] = py;
            largest = Math.max(largest, Math.abs(px) + Math.abs(py));
            x += px;
            y += py;
          }
          if (e < 1) {
            x = d.sx[i] + (x - d.sx[i]) * e;
            y = d.sy[i] + (y - d.sy[i]) * e;
          }
          const r = d.r[i];
          ctx.rect(x - r, y - r, r * 2, r * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Keep easing the dots back until they are home.
      disturbed = moving && (active || largest > 0.02);
      if (!arrived && gather >= d.end) {
        settled = true;
        root.dataset.state = 'full';
      }
    };

    const running = () => ready && revealed && visible && !disposed && !reduced && !document.hidden;
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    function tick(now: number): void {
      frame = 0;
      if (!running()) return;
      // A capped step: after a pause (off screen, hidden tab) the wave continues where it stopped.
      clock += last ? Math.min(now - last, 50) : 16.7;
      last = now;
      if (!lastDraw || now - lastDraw >= FRAME_MS) {
        lastDraw = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    const start = () => {
      if (frame || !running()) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    /** The first canvas frame, then the real text steps aside: there is never a blank frame. */
    const reveal = () => {
      if (revealed || !dots) return;
      revealed = true;
      gatherStart = clock;
      if (reduced) settled = true;
      draw();
      canvas.style.visibility = 'visible';
      root.style.setProperty('-webkit-text-fill-color', 'transparent');
      root.dataset.state = reduced ? 'still' : 'gathering';
      start();
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };
    const onLeave = () => {
      pointerX = -1e4;
      pointerY = -1e4;
    };
    // Pointer listeners exist only on a fine pointer (a mouse or trackpad), never on a touch-only device.
    const listen = () => {
      const want = (fineQuery?.matches ?? false) && !reduced;
      if (want === listening) return;
      listening = want;
      if (want) {
        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', onLeave);
      } else {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('mouseleave', onLeave);
        onLeave();
      }
    };

    const refresh = () => {
      if (!ready || !measure()) return;
      if (revealed && !running()) draw();
    };
    const init = () => {
      if (disposed) return;
      readPalette();
      ready = true;
      if (!measure()) return;
      listen();
      if (reduced) reveal();
      else if (visible && ratio >= REVEAL_RATIO) reveal();
    };

    const onTheme = () => {
      readPalette();
      if (revealed && !running()) draw();
    };

    const onReduced = () => {
      reduced = reducedQuery?.matches ?? false;
      stop();
      listen();
      if (!ready) return;
      if (reduced) {
        settled = true;
        if (!revealed) reveal();
        else draw();
      } else {
        start();
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[entries.length - 1];
              visible = entry.isIntersecting;
              ratio = entry.intersectionRatio;
              if (visible && ready && !revealed && ratio >= REVEAL_RATIO) reveal();
              if (visible) start();
              else stop();
            },
            { threshold: [0, REVEAL_RATIO] },
          )
        : null;
    io?.observe(root);
    const parent = root.parentElement;
    const ro = typeof ResizeObserver === 'function' && parent ? new ResizeObserver(refresh) : null;
    if (parent) ro?.observe(parent);
    const themeObserver = typeof MutationObserver === 'function' ? new MutationObserver(onTheme) : null;
    themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    reducedQuery?.addEventListener('change', onReduced);
    fineQuery?.addEventListener('change', listen);
    document.addEventListener('visibilitychange', onVisibility);

    // Build the dots only when the footer comes near the screen: the footer is on every page, and most
    // readers never scroll that far. The mask must also use the real web font, never the fallback.
    let fontsReady = false;
    let near = typeof IntersectionObserver !== 'function';
    const maybeInit = () => {
      if (fontsReady && near && !ready) init();
    };
    const nearObserver = near
      ? null
      : new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            near = true;
            nearObserver?.disconnect();
            maybeInit();
          },
          { rootMargin: '400px 0px' },
        );
    nearObserver?.observe(root);
    const onFontsReady = () => {
      fontsReady = true;
      maybeInit();
    };
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts?.ready) fonts.ready.then(onFontsReady, onFontsReady);
    else onFontsReady();

    return () => {
      disposed = true;
      stop();
      nearObserver?.disconnect();
      if (listening) {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('mouseleave', onLeave);
      }
      io?.disconnect();
      ro?.disconnect();
      themeObserver?.disconnect();
      reducedQuery?.removeEventListener('change', onReduced);
      fineQuery?.removeEventListener('change', listen);
      document.removeEventListener('visibilitychange', onVisibility);
      root.style.removeProperty('-webkit-text-fill-color');
      canvas.style.visibility = 'hidden';
      delete root.dataset.state;
    };
  }, [text, accentTail]);

  return (
    <span ref={rootRef} className="dot-wordmark">
      {text}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="dot-wordmark-canvas"
        style={{ visibility: 'hidden', left: 0, top: 0, width: 0, height: 0 }}
      />
    </span>
  );
}
