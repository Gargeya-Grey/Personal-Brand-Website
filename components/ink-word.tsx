'use client';

import { useEffect, useRef } from 'react';
import './ink-word.css';

/*
 * One key word, drawn as a vessel being filled. The word first shows as hollow letters; fine ink dots
 * then fall into them and pile up from the bottom until the word stands full. Adapted from Edudojo's
 * hero word ("Process"), so both sites share the same stipple and the same motion.
 *
 * The word stays real text. The server renders it as normal solid text, so the h1 reads fully before
 * hydration and without JavaScript. Once the canvas has drawn its first frame, the text turns
 * transparent (still selectable, still read by screen readers) and the aria-hidden canvas sits exactly
 * over it. The canvas draws the text with the span's own computed font and uses it as a mask, so the
 * dots and the outline follow the real glyphs.
 */

/** Dots land over this span (ms), bottom first. With the fall time, the word is full in about 2.6s. */
export const FILL_MS = 2000;
/** A short pause on the hollow word before the first dot falls, so the outline registers first. */
export const START_MS = 140;
/** Space around the text box for the outline and for glyph ink that overhangs the font box. */
const PAD = 6;
const OUTLINE_PX = 1.25;
const MAX_DOTS = 12000;
const MIN_R = 0.55;
const MAX_R = 1.4;
/** Share of dots in the leaf accent, and share that shimmer slowly once the word is full. */
const LEAF_SHARE = 0.006;
const SHIMMER_SHARE = 0.03;
/** After the last dot lands, the outline steps back over this time; then the word is still. */
const SETTLE_MS = 900;

/** Alpha buckets: dots are batched into one path per bucket and tone, so a frame is a few fills. */
const BUCKETS = 10;
const TONES = 2; // ink, leaf
const KEYS = BUCKETS * TONES;
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/** Small seeded generator, so the word stipples the same way on every visit (and in every test). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Dot spacing (CSS px) for a font size. Small type needs tighter dots, or the thin strokes of a
 * 44px word break up and stop reading as letters.
 */
export function spacingFor(fontPx: number): number {
  return Math.min(1.15, Math.max(1, fontPx / 66));
}

export interface Targets {
  x: Float32Array;
  y: Float32Array;
}

/**
 * Where the dots rest: a jittered, row-offset grid kept only where the text mask is inked.
 * `rgba` is the mask's image data (`width` x `height` device px); `scale` is device px per CSS px.
 */
export function sampleTargets(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  scale: number,
  spacing: number,
  seed: number,
): Targets {
  const rand = mulberry32(seed);
  const xs: number[] = [];
  const ys: number[] = [];
  const cssW = width / scale;
  const cssH = height / scale;
  let row = 0;
  for (let gy = spacing / 2; gy < cssH; gy += spacing * 0.866, row++) {
    const shift = row % 2 ? spacing / 2 : 0;
    for (let gx = spacing / 2 + shift; gx < cssW; gx += spacing) {
      const x = gx + (rand() - 0.5) * spacing * 0.8;
      const y = gy + (rand() - 0.5) * spacing * 0.8;
      const px = Math.floor(x * scale);
      const py = Math.floor(y * scale);
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      // Dots that straddle an edge are kept: the mask clips them, so the edges come out crisp.
      if (rgba[(py * width + px) * 4 + 3] < 40) continue;
      xs.push(x);
      ys.push(y);
      if (xs.length >= MAX_DOTS) return { x: Float32Array.from(xs), y: Float32Array.from(ys) };
    }
  }
  return { x: Float32Array.from(xs), y: Float32Array.from(ys) };
}

/** Every dot of the word, sorted by landing time. */
export interface Dots {
  count: number;
  x: Float32Array;
  /** Resting place. */
  y: Float32Array;
  /** Where the fall starts, above the word. */
  y0: Float32Array;
  r: Float32Array;
  a: Float32Array;
  launch: Float32Array;
  land: Float32Array;
  leaf: Uint8Array;
  shimmer: Uint8Array;
  seed: Float32Array;
  /** Longest fall (ms): a dot landing at `t` is in the air no earlier than `t - maxFall`. */
  maxFall: number;
  /** When the last dot lands (ms): the word is full. */
  end: number;
}

/** Gravity in CSS px per ms², scaled to the type so a fall across the word takes about a third of a second. */
function gravity(fontPx: number): number {
  return (fontPx * 18) / 1e6;
}

/**
 * Turns resting places into falling dots. Landing order rises from the bottom (with a little
 * disorder, so the surface of the pile is grainy, not a ruled line); each dot falls straight down
 * under gravity from just above the word and lands at its time.
 */
export function buildDots(targets: Targets, fontPx: number, seed: number): Dots {
  const n = targets.x.length;
  const rand = mulberry32(seed ^ 0x9e3779b9);
  let top = Infinity;
  let bottom = -Infinity;
  for (let i = 0; i < n; i++) {
    top = Math.min(top, targets.y[i]);
    bottom = Math.max(bottom, targets.y[i]);
  }
  const span = Math.max(1, bottom - top);
  const g = gravity(fontPx);
  const level = new Float32Array(n);
  const start = new Float32Array(n);
  const fall = new Float32Array(n);
  let maxFall = 0;
  for (let i = 0; i < n; i++) {
    level[i] = (bottom - targets.y[i]) / span + (rand() - 0.5) * 0.12;
    start[i] = top - 4 - rand() * fontPx * 0.35;
    fall[i] = Math.sqrt((2 * (targets.y[i] - start[i])) / g);
    maxFall = Math.max(maxFall, fall[i]);
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((p, q) => level[p] - level[q]);
  const dots: Dots = {
    count: n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    y0: new Float32Array(n),
    r: new Float32Array(n),
    a: new Float32Array(n),
    launch: new Float32Array(n),
    land: new Float32Array(n),
    leaf: new Uint8Array(n),
    shimmer: new Uint8Array(n),
    seed: new Float32Array(n),
    maxFall,
    end: 0,
  };
  for (let rank = 0; rank < n; rank++) {
    const k = order[rank];
    const u = n > 1 ? rank / (n - 1) : 1;
    // Quick at first (the word starts filling at once), easing out as the last tops of the letters close.
    const land = START_MS + maxFall + FILL_MS * (1 - (1 - u) ** 1.15);
    dots.x[rank] = targets.x[k];
    dots.y[rank] = targets.y[k];
    dots.y0[rank] = start[k];
    dots.land[rank] = land;
    dots.launch[rank] = land - fall[k];
    // Most dots fine, a few larger: the stipple of the margins.
    dots.r[rank] = MIN_R + (MAX_R - MIN_R) * rand() ** 1.25;
    // Settled weight: a touch darker toward the bottom of the pile.
    dots.a[rank] = (0.62 + 0.36 * rand()) * (0.9 + 0.1 * ((targets.y[k] - top) / span));
    const pick = rand();
    dots.leaf[rank] = pick < LEAF_SHARE ? 1 : 0;
    // Accent dots stay fine: a fleck of green inside the ink, never a spot.
    if (dots.leaf[rank]) dots.r[rank] = Math.min(dots.r[rank], 0.8);
    dots.shimmer[rank] = pick >= LEAF_SHARE && pick < LEAF_SHARE + SHIMMER_SHARE ? 1 : 0;
    dots.seed[rank] = rand() * Math.PI * 2;
    dots.end = Math.max(dots.end, land);
  }
  return dots;
}

/** Height of dot `i` at time `t` (ms): resting once landed, falling under gravity before. */
export function dotY(dots: Dots, i: number, t: number): number {
  if (t >= dots.land[i]) return dots.y[i];
  if (t <= dots.launch[i]) return dots.y0[i];
  const p = (t - dots.launch[i]) / (dots.land[i] - dots.launch[i]);
  return dots.y0[i] + (dots.y[i] - dots.y0[i]) * p * p;
}

/** Slow alpha breath of a shimmer dot once the word is full: never below 55% of its own alpha. */
export function shimmerAlpha(base: number, seed: number, t: number): number {
  return base * (0.775 + 0.225 * Math.sin(t * 0.0011 + seed));
}

function bucketOf(alpha: number): number {
  const b = Math.floor(alpha * BUCKETS);
  return b < 0 ? 0 : b >= BUCKETS ? BUCKETS - 1 : b;
}

interface Palette {
  ink: string;
  leaf: string;
}

function makeCanvas(): HTMLCanvasElement {
  return document.createElement('canvas');
}

export function InkWord({ word }: { word: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext('2d');
    // No canvas (old browser, test DOM) or no canvas letter spacing (the mask would drift off the
    // glyphs): keep the solid text, which is already right.
    if (!ctx || !('letterSpacing' in ctx)) return;

    const mask = makeCanvas();
    const outline = makeCanvas();
    const settled = makeCanvas();
    const maskCtx = mask.getContext('2d');
    const outlineCtx = outline.getContext('2d');
    const settledCtx = settled.getContext('2d');
    if (!maskCtx || !outlineCtx || !settledCtx) return;

    const reducedQuery = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_QUERY) : null;
    let reduced = reducedQuery?.matches ?? false;
    let palette: Palette = { ink: '#1B1A18', leaf: '#FF8000' };
    let dots: Dots | null = null;
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    let sizeKey = '';
    let clock = 0;
    let last = 0;
    let frame = 0;
    let settledUpTo = 0;
    let visible = true;
    let ready = false;
    let disposed = false;

    /** Reduced motion, or the word is full and its outline has settled: draw once, no loop. */
    const still = () => reduced || (dots !== null && clock >= dots.end + SETTLE_MS);
    // Per-frame batching scratch for the dots in the air (and the shimmer dots), sized per build.
    let keys = new Uint8Array(0);
    let list = new Uint32Array(0);
    let sorted = new Uint32Array(0);
    const counts = new Uint32Array(KEYS + 1);

    const readPalette = () => {
      const css = getComputedStyle(root);
      palette = {
        ink: css.getPropertyValue('--ink').trim() || palette.ink,
        leaf: css.getPropertyValue('--leaf').trim() || palette.leaf,
      };
    };

    const drawOutline = (font: string, spacing: string, x: number, baseline: number) => {
      outlineCtx.setTransform(1, 0, 0, 1, 0, 0);
      outlineCtx.clearRect(0, 0, outline.width, outline.height);
      outlineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      outlineCtx.font = font;
      outlineCtx.letterSpacing = spacing;
      outlineCtx.lineJoin = 'round';
      outlineCtx.lineWidth = OUTLINE_PX;
      outlineCtx.strokeStyle = palette.ink;
      outlineCtx.strokeText(word, x, baseline);
    };

    let textX = 0;
    let baseline = 0;
    let font = '';
    let spacing = '0px';

    /** Draws dot `i` into the settled layer (device transform already set). */
    const settleDot = (i: number) => {
      if (!dots) return;
      settledCtx.globalAlpha = dots.a[i];
      settledCtx.fillStyle = dots.leaf[i] ? palette.leaf : palette.ink;
      settledCtx.beginPath();
      settledCtx.arc(dots.x[i], dots.y[i], dots.r[i], 0, Math.PI * 2);
      settledCtx.fill();
    };

    /** Redraws the whole settled layer up to the current pointer, batched (resize, theme, reduced motion). */
    const repaintSettled = (includeShimmer: boolean) => {
      settledCtx.setTransform(1, 0, 0, 1, 0, 0);
      settledCtx.globalAlpha = 1;
      settledCtx.clearRect(0, 0, settled.width, settled.height);
      if (!dots) return;
      settledCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let tone = 0; tone < TONES; tone++) {
        settledCtx.fillStyle = tone ? palette.leaf : palette.ink;
        for (let b = 0; b < BUCKETS; b++) {
          settledCtx.globalAlpha = (b + 0.5) / BUCKETS;
          settledCtx.beginPath();
          for (let i = 0; i < settledUpTo; i++) {
            if (dots.leaf[i] !== tone || bucketOf(dots.a[i]) !== b) continue;
            if (dots.shimmer[i] && !includeShimmer) continue;
            settledCtx.moveTo(dots.x[i] + dots.r[i], dots.y[i]);
            settledCtx.arc(dots.x[i], dots.y[i], dots.r[i], 0, Math.PI * 2);
          }
          settledCtx.fill();
        }
      }
      settledCtx.globalAlpha = 1;
    };

    /** Measures the span and rebuilds canvases and dots when its size, font or pixel ratio changed. */
    const measure = (): boolean => {
      const css = getComputedStyle(root);
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      const fontPx = parseFloat(css.fontSize) || 16;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
      spacing = css.letterSpacing === 'normal' ? '0px' : css.letterSpacing;
      // Align the canvas to the device pixel grid: the browser would otherwise snap a canvas that
      // starts between pixels, and the dots would sit up to half a pixel off the real glyphs.
      const fracX = rect.left - Math.floor(rect.left * dpr) / dpr;
      const fracY = rect.top - Math.floor(rect.top * dpr) / dpr;
      const key = `${rect.width.toFixed(2)}|${rect.height.toFixed(2)}|${font}|${spacing}|${dpr}|${fracX.toFixed(3)}|${fracY.toFixed(3)}`;
      if (key === sizeKey) return true;
      sizeKey = key;

      cssW = rect.width + PAD * 2 + 1;
      cssH = rect.height + PAD * 2 + 1;
      canvas.style.left = `${-PAD - fracX}px`;
      canvas.style.top = `${-PAD - fracY}px`;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      for (const c of [canvas, mask, outline, settled]) {
        c.width = Math.round(cssW * dpr);
        c.height = Math.round(cssH * dpr);
      }

      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.font = font;
      maskCtx.letterSpacing = spacing;
      const m = maskCtx.measureText(word);
      const ascent = m.fontBoundingBoxAscent;
      const descent = m.fontBoundingBoxDescent;
      // The inline box is the font's ascent plus descent; centre on it in case the two disagree.
      textX = PAD + fracX;
      baseline = PAD + fracY + (rect.height - (ascent + descent)) / 2 + ascent;
      maskCtx.fillStyle = '#000';
      maskCtx.fillText(word, textX, baseline);
      drawOutline(font, spacing, textX, baseline);

      const image = maskCtx.getImageData(0, 0, mask.width, mask.height);
      const targets = sampleTargets(image.data, mask.width, mask.height, dpr, spacingFor(fontPx), 0x5eed);
      dots = buildDots(targets, fontPx, 0x5eed);
      const n = dots.count;
      keys = new Uint8Array(n);
      list = new Uint32Array(n);
      sorted = new Uint32Array(n);
      // A rebuild mid-fill keeps the clock: what had landed is painted at once, the rest keeps falling.
      settledUpTo = 0;
      while (settledUpTo < n && dots.land[settledUpTo] <= clock) settledUpTo++;
      repaintSettled(still());
      return true;
    };

    /** One composite: settled layer, dots in the air, the text mask, then the outline on top. */
    const draw = (t: number) => {
      if (!dots) return;
      const d = dots;
      const n = d.count;
      const full = t >= d.end;
      while (settledUpTo < n && d.land[settledUpTo] <= t) {
        settledCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!d.shimmer[settledUpTo] || still()) settleDot(settledUpTo);
        settledUpTo++;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(settled, 0, 0);

      // The dynamic dots: in the air now, plus the landed shimmer dots (unless the word is still and
      // they are already painted into the settled layer).
      let m = 0;
      if (!still()) {
        for (let i = 0; i < settledUpTo; i++) {
          if (!d.shimmer[i]) continue;
          const a = full ? shimmerAlpha(d.a[i], d.seed[i], t) : d.a[i];
          keys[i] = (d.leaf[i] ? BUCKETS : 0) + bucketOf(a);
          list[m++] = i;
        }
        for (let i = settledUpTo; i < n && d.land[i] - d.maxFall <= t; i++) {
          if (t < d.launch[i]) continue;
          // In the air a dot is a little fainter, so the fall reads as motion and the pile as matter.
          keys[i] = (d.leaf[i] ? BUCKETS : 0) + bucketOf(d.a[i] * 0.8);
          list[m++] = i;
        }
      }
      if (m > 0) {
        counts.fill(0);
        for (let j = 0; j < m; j++) counts[keys[list[j]] + 1]++;
        for (let c = 1; c <= KEYS; c++) counts[c] += counts[c - 1];
        for (let j = 0; j < m; j++) sorted[counts[keys[list[j]]]++] = list[j];
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        let from = 0;
        for (let c = 0; c < KEYS; c++) {
          const to = counts[c];
          if (to > from) {
            ctx.fillStyle = c >= BUCKETS ? palette.leaf : palette.ink;
            ctx.globalAlpha = ((c % BUCKETS) + 0.5) / BUCKETS;
            ctx.beginPath();
            for (let j = from; j < to; j++) {
              const i = sorted[j];
              const y = dotY(d, i, t);
              ctx.moveTo(d.x[i] + d.r[i], y);
              ctx.arc(d.x[i], y, d.r[i], 0, Math.PI * 2);
            }
            ctx.fill();
          }
          from = to;
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      // The outline carries the hollow word; once it is full it steps back a little and the dots lead.
      const settle = full ? Math.min(1, (t - d.end) / SETTLE_MS) : 0;
      ctx.globalAlpha = 0.9 - 0.35 * settle;
      ctx.drawImage(outline, 0, 0);
      ctx.globalAlpha = 1;
      const state = full ? 'full' : 'filling';
      if (root.dataset.state !== state) root.dataset.state = state;
    };

    const reveal = () => {
      // Only now does the real text step aside: the canvas has drawn, so there is never a blank frame.
      canvas.style.visibility = 'visible';
      root.style.color = 'transparent';
    };

    const running = () => ready && !disposed && !still() && visible && !document.hidden;
    const start = (): void => {
      if (frame || !running()) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    function tick(now: number): void {
      frame = 0;
      if (!running()) return;
      // A capped step: after a pause (off screen, hidden tab) the fill continues where it stopped.
      clock += last ? Math.min(now - last, 50) : 16.7;
      last = now;
      draw(clock);
      if (still()) {
        // Done: the shimmer dots join the settled layer and the loop ends. Nothing loops for attention.
        repaintSettled(true);
        draw(clock);
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    const refresh = () => {
      if (!ready || !measure() || !dots) return;
      if (reduced) {
        clock = Math.max(clock, dots.end + SETTLE_MS);
        settledUpTo = dots.count;
        repaintSettled(true);
      }
      draw(clock);
      // A rebuild can move the end of the fill past the clock: carry on if so.
      start();
    };

    const init = () => {
      if (disposed) return;
      readPalette();
      ready = true;
      if (!measure() || !dots) return;
      if (reduced) {
        // Reduced motion: the filled word, at once and still.
        clock = dots.end + SETTLE_MS;
        settledUpTo = dots.count;
        repaintSettled(true);
      }
      draw(clock);
      reveal();
      start();
    };

    const onTheme = () => {
      readPalette();
      if (!ready) return;
      repaintSettled(still());
      drawOutline(font, spacing, textX, baseline);
      draw(clock);
    };
    const onReduced = () => {
      reduced = reducedQuery?.matches ?? false;
      if (!ready || !dots) return;
      stop();
      if (reduced) {
        refresh();
      } else {
        repaintSettled(still());
        draw(clock);
        start();
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => refresh();

    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            visible = entries.some((e) => e.isIntersecting);
            if (visible) start();
            else stop();
          })
        : null;
    io?.observe(canvas);
    const heading = root.closest('h1') ?? root.parentElement;
    const ro = typeof ResizeObserver === 'function' && heading ? new ResizeObserver(onResize) : null;
    if (heading) ro?.observe(heading);
    const themeObserver = typeof MutationObserver === 'function' ? new MutationObserver(onTheme) : null;
    themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    reducedQuery?.addEventListener('change', onReduced);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });

    // The mask must use the real web font, never the fallback, or the dots would miss the glyphs.
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts?.ready) fonts.ready.then(init, init);
    else init();

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      ro?.disconnect();
      themeObserver?.disconnect();
      reducedQuery?.removeEventListener('change', onReduced);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      root.style.color = '';
      canvas.style.visibility = 'hidden';
      delete root.dataset.state;
    };
  }, [word]);

  return (
    <span ref={rootRef} className="ink-word">
      {word}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="ink-word-canvas"
        style={{ visibility: 'hidden', left: 0, top: 0, width: 0, height: 0 }}
      />
    </span>
  );
}
