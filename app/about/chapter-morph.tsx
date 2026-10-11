'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { hashText, inkedPixels, mulberry32, sampleWord, wordSpacing } from '@/lib/stipple';
import './chapter-morph.css';

/*
 * The chapter heading, morphing through dots. When the text changes, the old heading dissolves into ink
 * dots that travel and gather into the new heading, then hand off to the real text.
 *
 * The heading stays real text. React swaps the text at once (screen readers get the new heading with
 * no wait); the visible swap is a canvas overlay. Each heading is laid out word by word from the DOM
 * (Range rectangles), so line wrapping, font and letter spacing match the real text exactly. The loop
 * runs only while a morph runs; idle, nothing runs.
 */

/** Room around the heading box for dots that swing out of it. */
const PAD = 10;
/** Most dots in one morph. */
const MAX_DOTS = 5500;
/** Tightest dot spacing (CSS px). */
const MIN_SPACING = 1.3;
/** Whole morph (ms): the last dot starts by DELAY_SWEEP_MS + DELAY_JITTER_MS and travels for TRAVEL_MS. */
const DURATION_MS = 720;
const TRAVEL_MS = 520;
const DELAY_SWEEP_MS = 140;
const DELAY_JITTER_MS = 60;
/** The old text fades into dots over this time; the new text fades in out of dots over the last SOLID_IN_MS. */
const SOLID_OUT_MS = 140;
const SOLID_IN_MS = 160;
const LEAF_SHARE = 0.04;
const LEVELS = 6;
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

interface Word {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A heading as laid out in the page, in CSS px relative to the heading box. */
interface Layout {
  text: string;
  words: Word[];
  width: number;
  height: number;
  font: string;
  spacing: string;
  fontPx: number;
}

interface Dots {
  x: Float32Array;
  y: Float32Array;
  spacing: number;
}

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const smooth = (value: number) => {
  const c = clamp01(value);
  return c * c * (3 - 2 * c);
};
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

/** Lays out the heading's current text, one rectangle per word. Null if it cannot be measured. */
function measureLayout(heading: HTMLElement): Layout | null {
  const node = heading.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = (node as Text).data;
  const box = heading.getBoundingClientRect();
  if (box.width <= 0 || box.height <= 0) return null;
  const css = getComputedStyle(heading);
  const range = document.createRange();
  const words: Word[] = [];
  for (const match of text.matchAll(/\S+/g)) {
    const start = match.index ?? 0;
    range.setStart(node, start);
    range.setEnd(node, start + match[0].length);
    const rect = range.getBoundingClientRect();
    if (rect.width <= 0) continue;
    words.push({
      text: match[0],
      x: rect.left - box.left,
      y: rect.top - box.top,
      w: rect.width,
      h: rect.height,
    });
  }
  if (words.length === 0) return null;
  return {
    text,
    words,
    width: box.width,
    height: box.height,
    font: `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`,
    spacing: css.letterSpacing === 'normal' ? '0px' : css.letterSpacing,
    fontPx: parseFloat(css.fontSize) || 16,
  };
}

/** Fills the layout's words at their real positions. The caller sets the fill style. */
function drawWords(ctx: CanvasRenderingContext2D, layout: Layout) {
  ctx.font = layout.font;
  ctx.letterSpacing = layout.spacing;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const word of layout.words) {
    const metrics = ctx.measureText(word.text);
    const ascent = metrics.fontBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent;
    // The inline box is the font's ascent plus descent; centre on it in case the two disagree.
    const baseline = PAD + word.y + (word.h - (ascent + descent)) / 2 + ascent;
    ctx.fillText(word.text, PAD + word.x, baseline);
  }
}

const dotsCache = new Map<string, Dots>();

/** The dots of a heading, in reading order (line by line, left to right). Remembered per heading. */
function sampleLayout(
  layout: Layout,
  mask: HTMLCanvasElement,
  maskCtx: CanvasRenderingContext2D,
): Dots {
  const key = `${layout.text}|${Math.round(layout.width)}|${layout.font}|${layout.spacing}`;
  const cached = dotsCache.get(key);
  if (cached) return cached;
  const width = Math.ceil(layout.width + PAD * 2);
  const height = Math.ceil(layout.height + PAD * 2);
  mask.width = width;
  mask.height = height;
  maskCtx.setTransform(1, 0, 0, 1, 0, 0);
  maskCtx.clearRect(0, 0, width, height);
  maskCtx.fillStyle = '#000';
  drawWords(maskCtx, layout);
  const image = maskCtx.getImageData(0, 0, width, height);
  const spacing = wordSpacing(inkedPixels(image.data, width, height), MIN_SPACING, MAX_DOTS);
  const points = sampleWord(image.data, width, height, spacing, hashText(layout.text), MAX_DOTS);

  const lineCentres: number[] = [];
  for (const word of layout.words) {
    const centre = PAD + word.y + word.h / 2;
    if (!lineCentres.some((c) => Math.abs(c - centre) < layout.fontPx * 0.5))
      lineCentres.push(centre);
  }
  lineCentres.sort((a, b) => a - b);
  const count = points.x.length;
  const order = new Float64Array(count);
  const index = Array.from({ length: count }, (_, i) => i);
  for (let i = 0; i < count; i++) {
    let line = 0;
    for (let l = 1; l < lineCentres.length; l++) {
      if (Math.abs(points.y[i] - lineCentres[l]) < Math.abs(points.y[i] - lineCentres[line]))
        line = l;
    }
    order[i] = line * 100000 + points.x[i];
  }
  index.sort((a, b) => order[a] - order[b]);
  const dots: Dots = {
    x: Float32Array.from(index, (i) => points.x[i]),
    y: Float32Array.from(index, (i) => points.y[i]),
    spacing,
  };
  if (dotsCache.size >= 16) dotsCache.delete(dotsCache.keys().next().value as string);
  dotsCache.set(key, dots);
  return dots;
}

/** One morph. Dot j travels from (fx, fy) to (tx, ty); a padding dot (extra on the larger side) fades in or out. */
interface Run {
  startedAt: number;
  count: number;
  fx: Float32Array;
  fy: Float32Array;
  fa: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
  ta: Float32Array;
  delay: Float32Array;
  arcX: Float32Array;
  arcY: Float32Array;
  radius: Float32Array;
  leaf: Uint8Array;
  /** The old text, drawn solid and fading out into dots; null when a morph was retargeted mid-way. */
  fromLayout: Layout | null;
  toLayout: Layout;
  cssWidth: number;
  cssHeight: number;
  headingWidth: number;
  dpr: number;
}

interface Morpher {
  /** Starts (or retargets) a morph from `prev` to `next`. False: not started, the text just swaps. */
  start(prev: Layout, next: Layout): boolean;
  active(): boolean;
  headingWidth(): number;
  cancel(): void;
  dispose(): void;
}

function createMorpher(heading: HTMLElement, canvas: HTMLCanvasElement): Morpher | null {
  const ctx = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskCtx = mask.getContext('2d', { willReadFrequently: true });
  // No canvas, no canvas letter spacing (the dots would drift off the glyphs) or no font metrics: the
  // text just swaps, which is already right.
  if (!ctx || !maskCtx || !('letterSpacing' in ctx)) return null;
  if (typeof ctx.measureText('x').fontBoundingBoxAscent !== 'number') return null;

  let run: Run | null = null;
  let frame = 0;
  let ink = '#14201C';
  let leafColor = '#10B981';
  let canvasCssHeight = 0;
  let scratchX = new Float32Array(0);
  let scratchY = new Float32Array(0);
  let scratchKey = new Uint8Array(0);

  /** Dot j at time t (ms): position and opacity. */
  const place = (r: Run, j: number, t: number, out: { x: number; y: number; a: number }) => {
    const e = easeInOutCubic(clamp01((t - r.delay[j]) / TRAVEL_MS));
    // Dots swing a little off the straight line, so the move reads as a swarm, not a slide.
    const swing = Math.sin(Math.PI * e);
    out.x = r.fx[j] + (r.tx[j] - r.fx[j]) * e + r.arcX[j] * swing;
    out.y = r.fy[j] + (r.ty[j] - r.fy[j]) * e + r.arcY[j] * swing;
    out.a = r.fa[j] + (r.ta[j] - r.fa[j]) * e;
  };

  const finish = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    run = null;
    // Same task: the canvas clears as the real text turns opaque, so there is no blank frame.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.visibility = 'hidden';
    delete heading.dataset.morphing;
  };

  const draw = (r: Run, t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(r.dpr, 0, 0, r.dpr, 0, 0);
    const solidOut = r.fromLayout ? 1 - smooth(t / SOLID_OUT_MS) : 0;
    const solidIn = smooth((t - (DURATION_MS - SOLID_IN_MS)) / SOLID_IN_MS);
    const dotsIn = r.fromLayout ? smooth(t / SOLID_OUT_MS) : 1;
    const gate = Math.min(dotsIn, 1 - solidIn);

    ctx.fillStyle = ink;
    if (r.fromLayout && solidOut > 0) {
      ctx.globalAlpha = solidOut;
      drawWords(ctx, r.fromLayout);
    }
    if (solidIn > 0) {
      ctx.globalAlpha = solidIn;
      drawWords(ctx, r.toLayout);
    }

    const point = { x: 0, y: 0, a: 0 };
    for (let j = 0; j < r.count; j++) {
      place(r, j, t, point);
      scratchX[j] = point.x;
      scratchY[j] = point.y;
      const alpha = clamp01(point.a * gate);
      scratchKey[j] =
        alpha < 0.04
          ? 255
          : (r.leaf[j] ? LEVELS : 0) + Math.min(LEVELS - 1, Math.floor(alpha * LEVELS));
    }
    // Dots are batched by tone and opacity level: a frame is a dozen fills, not thousands.
    for (let key = 0; key < LEVELS * 2; key++) {
      ctx.globalAlpha = ((key % LEVELS) + 0.5) / LEVELS;
      ctx.fillStyle = key >= LEVELS ? leafColor : ink;
      ctx.beginPath();
      for (let j = 0; j < r.count; j++) {
        if (scratchKey[j] !== key) continue;
        ctx.moveTo(scratchX[j] + r.radius[j], scratchY[j]);
        ctx.arc(scratchX[j], scratchY[j], r.radius[j], 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const tick = () => {
    frame = 0;
    if (!run) return;
    const t = performance.now() - run.startedAt;
    if (t >= DURATION_MS || document.hidden) {
      finish();
      return;
    }
    draw(run, t);
    frame = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden && run) finish();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start(prev, next) {
      if (document.hidden || Math.abs(prev.width - next.width) > 1) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const to = sampleLayout(next, mask, maskCtx);
      if (to.x.length === 0) return false;

      let fromX: Float32Array;
      let fromY: Float32Array;
      let fromA: Float32Array;
      let fromLayout: Layout | null = null;
      let spacingFrom = to.spacing;
      let contentHeight = Math.max(prev.height, next.height);
      if (run) {
        // A change mid-morph: the dots carry on from where they are now.
        const t = performance.now() - run.startedAt;
        const point = { x: 0, y: 0, a: 0 };
        fromX = new Float32Array(run.count);
        fromY = new Float32Array(run.count);
        fromA = new Float32Array(run.count);
        for (let j = 0; j < run.count; j++) {
          place(run, j, t, point);
          fromX[j] = point.x;
          fromY[j] = point.y;
          fromA[j] = point.a;
        }
        contentHeight = Math.max(contentHeight, canvasCssHeight - PAD * 2);
      } else {
        const from = sampleLayout(prev, mask, maskCtx);
        if (from.x.length === 0) return false;
        fromX = from.x;
        fromY = from.y;
        fromA = new Float32Array(from.x.length).fill(1);
        fromLayout = prev;
        spacingFrom = from.spacing;
        const css = getComputedStyle(heading);
        ink = css.color || ink;
        leafColor = css.getPropertyValue('--leaf').trim() || leafColor;
      }

      const count = Math.min(Math.max(fromX.length, to.x.length), MAX_DOTS);
      const rand = mulberry32(hashText(next.text) ^ fromX.length);
      const cssWidth = Math.ceil(next.width + PAD * 2);
      const cssHeight = Math.ceil(contentHeight + PAD * 2);
      const r: Run = {
        startedAt: performance.now(),
        count,
        fx: new Float32Array(count),
        fy: new Float32Array(count),
        fa: new Float32Array(count),
        tx: new Float32Array(count),
        ty: new Float32Array(count),
        ta: new Float32Array(count),
        delay: new Float32Array(count),
        arcX: new Float32Array(count),
        arcY: new Float32Array(count),
        radius: new Float32Array(count),
        leaf: new Uint8Array(count),
        fromLayout,
        toLayout: next,
        cssWidth,
        cssHeight,
        headingWidth: next.width,
        dpr,
      };
      const fromCount = fromX.length;
      const toCount = to.x.length;
      const radiusBase = Math.min(spacingFrom, to.spacing);
      for (let j = 0; j < count; j++) {
        // Both sides are in reading order, so rank j on one pairs with rank j on the other. The smaller
        // side repeats its dots; a repeat (a padding dot) fades in or out instead of showing at full strength.
        const fi = Math.floor((j * fromCount) / count);
        const ti = Math.floor((j * toCount) / count);
        const fromRepeat = j > 0 && Math.floor(((j - 1) * fromCount) / count) === fi;
        const toRepeat = j > 0 && Math.floor(((j - 1) * toCount) / count) === ti;
        r.fx[j] = fromX[fi] + (fromRepeat ? (rand() - 0.5) * 3 : 0);
        r.fy[j] = fromY[fi] + (fromRepeat ? (rand() - 0.5) * 3 : 0);
        r.fa[j] = fromRepeat ? 0 : fromA[fi];
        r.tx[j] = to.x[ti] + (toRepeat ? (rand() - 0.5) * 3 : 0);
        r.ty[j] = to.y[ti] + (toRepeat ? (rand() - 0.5) * 3 : 0);
        r.ta[j] = toRepeat ? 0 : 1;
        r.delay[j] = clamp01(r.tx[j] / cssWidth) * DELAY_SWEEP_MS + rand() * DELAY_JITTER_MS;
        r.arcX[j] = (rand() - 0.5) * next.fontPx * 0.3;
        r.arcY[j] = (rand() - 0.5) * 2 * next.fontPx * 0.45;
        r.radius[j] = radiusBase * (0.42 + 0.24 * rand());
        r.leaf[j] = rand() < LEAF_SHARE ? 1 : 0;
      }

      canvasCssHeight = cssHeight;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.left = `${-PAD}px`;
      canvas.style.top = `${-PAD}px`;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      if (scratchX.length < count) {
        scratchX = new Float32Array(count);
        scratchY = new Float32Array(count);
        scratchKey = new Uint8Array(count);
      }
      run = r;
      // The first frame is drawn before the browser paints, with the real text already hidden.
      heading.dataset.morphing = 'true';
      canvas.style.visibility = 'visible';
      draw(r, 0);
      if (!frame) frame = requestAnimationFrame(tick);
      return true;
    },
    active: () => run !== null,
    headingWidth: () => run?.headingWidth ?? 0,
    cancel() {
      if (run) finish();
    },
    dispose() {
      document.removeEventListener('visibilitychange', onVisibility);
      finish();
    },
  };
}

export function ChapterHeading({ text }: { text: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const morpherRef = useRef<Morpher | null>(null);
  const layoutRef = useRef<Layout | null>(null);

  // Runs after React has swapped the text and before the browser paints: lay out the new text, then
  // start the dots from the old layout.
  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const previous = layoutRef.current;
    const next = measureLayout(heading);
    layoutRef.current = next;
    const morpher = morpherRef.current;
    if (!morpher || !previous || !next || previous.text === next.text) return;
    const reduced = window.matchMedia(REDUCED_QUERY).matches;
    if (reduced || !morpher.start(previous, next)) morpher.cancel();
  }, [text]);

  useEffect(() => {
    const heading = headingRef.current;
    const canvas = canvasRef.current;
    if (!heading || !canvas) return;
    const morpher = createMorpher(heading, canvas);
    morpherRef.current = morpher;

    // Keep the stored layout true to the page: the web font may arrive late, and the width can change.
    const remeasure = () => {
      if (morpher?.active()) return;
      const layout = measureLayout(heading);
      if (layout) layoutRef.current = layout;
    };
    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            if (morpher?.active()) {
              if (Math.abs(heading.getBoundingClientRect().width - morpher.headingWidth()) > 1)
                morpher.cancel();
              return;
            }
            remeasure();
          })
        : null;
    observer?.observe(heading);
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (!disposed) remeasure();
    });
    remeasure();
    return () => {
      disposed = true;
      observer?.disconnect();
      morpher?.dispose();
      morpherRef.current = null;
    };
  }, []);

  return (
    <h3 id="journey-chapter-title" ref={headingRef} className="chapter-heading">
      {text}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="chapter-heading-canvas"
        style={{ visibility: 'hidden' }}
      />
    </h3>
  );
}
