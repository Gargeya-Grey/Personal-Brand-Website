'use client';

import { useEffect } from 'react';
import {
  BOTTOM_PAD,
  MAX_ALPHA,
  MAX_PARTICLES,
  READING_LINE,
  TOP_SAFE,
  computeLanes,
  particleCount,
  stippleSymbol,
  symbolAt,
  symbolBox,
  symbolBudget,
  trailAlpha,
  trailPoint,
  trailSize,
  type Anchor,
  type Box,
  type MarginSymbol,
  type Side,
  type SymbolShape,
} from '@/lib/stipple';

/*
 * Living margins. Hundreds of very small particles breathe in each side margin of the page. Now and
 * then the particles in one margin gather into a finely stippled symbol for the section the reader is
 * in: they arrive along the strokes, like ink being drawn, hold the figure with a slow shimmer, then
 * let it go. Everything is dots. Ported from Edudojo's MarginPath (same drift, cursor response, gather,
 * shimmer and release), so both sites move the same way.
 *
 * It lives only outside the content column. The two canvases are sized to the margins themselves, so
 * even a drawing bug cannot reach the column or sit behind text. When the margins are too narrow
 * (every tablet and phone) it does nothing at all: no canvas, no loop, no pointer listeners.
 */

/** Minimum time between margin frames: about 30fps. */
const MARGIN_FRAME_MS = 32;
// Cycle timing (ms). Slow on purpose: the margins should breathe, not perform.
const DRIFT_MS = 6500;
const DRIFT_MIN_MS = 1800;
/** Dots start to arrive over this window, in stroke order; the last one settles about 1.6s later. */
const STAGGER_MS = 2000;
const SETTLE_MS = 1600;
const GATHER_MS = STAGGER_MS + SETTLE_MS;
const HOLD_MS = 5200;
const HOLD_MIN_MS = 1500;
/** One full pass of a trail dot from the page to the trail's end. Slow, so the shedding stays quiet. */
const TRAIL_CYCLE_MS = 9000;
const RELEASE_MS = 2800;

/** Alpha buckets: dots are batched into one path per bucket and tone, so a frame is a few dozen fills. */
const BUCKETS = 12;
const TONES = 2; // ink, leaf
const KEYS = BUCKETS * TONES;

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

type Phase = 'drift' | 'gather' | 'hold' | 'release';

interface Palette {
  ink: string;
  leaf: string;
}

/** One margin: its canvas and its particles, in typed arrays so the frame loop allocates nothing. */
interface Lane {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  box: Box;
  n: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  r: Float32Array;
  a: Float32Array;
  seed: Float32Array;
  /** Symbol dot each particle is gathering to, or -1. */
  target: Int32Array;
  /** 1 once a particle has been let go during release. */
  free: Uint8Array;
  /** Per frame: the radius and alpha to draw, and the batch key. */
  drawR: Float32Array;
  drawA: Float32Array;
  key: Uint8Array;
  order: Uint16Array;
  counts: Uint16Array;
  pool: Uint16Array;
  shape: SymbolShape | null;
  /** Centre of the current symbol, for the outward breath on release. */
  cx: number;
  cy: number;
  /** Time (ms) the trail has been flowing for the current figure. */
  flow: number;
}

function createLane(): Lane {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  // Fixed to the viewport, in the margin only. It paints above the app's own stacking context, so it
  // stays clear of the content by geometry: lanes sit outside the column and particles stay below
  // TOP_SAFE (under the fixed header). pointer-events none keeps it inert.
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:0;display:none';
  const f = () => new Float32Array(MAX_PARTICLES);
  return {
    canvas,
    ctx: canvas.getContext('2d'),
    box: { x: 0, y: 0, w: 0, h: 0 },
    n: 0,
    x: f(),
    y: f(),
    vx: f(),
    vy: f(),
    r: f(),
    a: f(),
    seed: f(),
    target: new Int32Array(MAX_PARTICLES).fill(-1),
    free: new Uint8Array(MAX_PARTICLES),
    drawR: f(),
    drawA: f(),
    key: new Uint8Array(MAX_PARTICLES),
    order: new Uint16Array(MAX_PARTICLES),
    counts: new Uint16Array(KEYS + 1),
    pool: new Uint16Array(MAX_PARTICLES),
    shape: null,
    cx: 0,
    cy: 0,
    flow: 0,
  };
}

/** Reads the ink and leaf from the page, so `html.dark` (which redefines them) just works. */
function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  return {
    ink: css.getPropertyValue('--ink').trim() || '#14201c',
    leaf: css.getPropertyValue('--leaf').trim() || '#10b981',
  };
}

/** Batch key: tone (ink or leaf) and alpha bucket. */
function batchKey(tone: number, alpha: number): number {
  const b = Math.floor((alpha / MAX_ALPHA) * BUCKETS);
  return tone * BUCKETS + (b < 0 ? 0 : b >= BUCKETS ? BUCKETS - 1 : b);
}

/** Smooth 0..1 ease with zero slope at both ends. */
function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

const sideName = (index: number): Side => (index === 0 ? 'left' : 'right');

export function MarginDots({
  sections,
  columnSelector = '.field-main',
}: {
  /** id = an element id on the page (a heading or section), in page order. */
  sections: readonly { id: string; symbol: MarginSymbol }[];
  /** The content column. Its content box (rect minus horizontal padding) decides where the margins are. */
  columnSelector?: string;
}) {
  // A caller may pass a fresh array on every render; the effect restarts only when the content changes.
  const sectionsKey = JSON.stringify(sections);

  useEffect(() => {
    const entries = JSON.parse(sectionsKey) as { id: string; symbol: MarginSymbol }[];
    if (entries.length === 0) return;

    const reducedQuery = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_QUERY) : null;
    let reduced = reducedQuery?.matches ?? false;
    let palette = readPalette();
    // Lanes (and their canvases and typed arrays) are made on first use, so a page whose margins are
    // too narrow never pays for them.
    let left: Lane | null = null;
    let right: Lane | null = null;
    let anchors: Anchor[] = [];
    let active = false;
    let onScreen = true;
    let listening = false;
    let frame = 0;
    let last = 0;
    let phase: Phase = 'drift';
    let phaseStart = 0;
    let side = 0;
    let formed: MarginSymbol | null = null;
    let mouseX = -1e4;
    let mouseY = -1e4;
    let stillKey = '';
    let disposed = false;
    const scratch = new Float32Array(2);

    const lanes = (): Lane[] => (left && right ? [left, right] : []);

    const seedParticles = (lane: Lane) => {
      const { w, h } = lane.box;
      lane.n = particleCount(lane.box);
      for (let i = 0; i < lane.n; i++) {
        lane.x[i] = Math.random() * w;
        lane.y[i] = TOP_SAFE + Math.random() * (h - TOP_SAFE - BOTTOM_PAD);
        lane.vx[i] = 0;
        lane.vy[i] = 0;
        // Most dots are tiny and faint; a few slightly larger ones give the field depth.
        const depth = Math.random() ** 2;
        lane.r[i] = 0.5 + depth * 0.5;
        lane.a[i] = 0.07 + depth * 0.13;
        lane.seed[i] = Math.random() * Math.PI * 2;
        lane.target[i] = -1;
        lane.free[i] = 0;
      }
      lane.shape = null;
    };

    const placeLane = (lane: Lane, box: Box) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const changed = box.w !== lane.box.w || box.h !== lane.box.h;
      lane.box = box;
      lane.canvas.style.left = `${box.x}px`;
      lane.canvas.style.width = `${box.w}px`;
      lane.canvas.style.height = `${box.h}px`;
      lane.canvas.style.display = 'block';
      if (changed) {
        lane.canvas.width = Math.round(box.w * dpr);
        lane.canvas.height = Math.round(box.h * dpr);
        lane.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        seedParticles(lane);
      }
    };

    /**
     * Gives each symbol dot a particle: the closest of a few random free ones. Cheap (no full search),
     * and the slight disorder is what makes particles cross the margin to reach their place.
     */
    const assign = (lane: Lane, shape: SymbolShape, box: Box) => {
      lane.shape = shape;
      lane.cx = box.x + box.w / 2;
      lane.cy = box.y + box.h / 2;
      lane.flow = 0;
      let free = lane.n;
      for (let i = 0; i < lane.n; i++) {
        lane.pool[i] = i;
        lane.target[i] = -1;
        lane.free[i] = 0;
      }
      const count = Math.min(shape.count, lane.n);
      for (let k = 0; k < count; k++) {
        let bestSlot = 0;
        let bestD = Infinity;
        for (let c = 0; c < 10; c++) {
          const slot = Math.floor(Math.random() * free);
          const i = lane.pool[slot];
          const d = (lane.x[i] - shape.x[k]) ** 2 + (lane.y[i] - shape.y[k]) ** 2;
          if (d < bestD) {
            bestD = d;
            bestSlot = slot;
          }
        }
        lane.target[lane.pool[bestSlot]] = k;
        lane.pool[bestSlot] = lane.pool[--free];
      }
    };

    /** Moves one lane's particles and sets what to draw. `mine` is true for the lane forming the symbol. */
    const step = (lane: Lane, now: number, k: number, mine: boolean, elapsed: number, breath: number) => {
      const { w, h } = lane.box;
      const shape = lane.shape;
      const mx = mouseX - lane.box.x;
      const my = mouseY;
      const damp = Math.pow(0.82, k);
      // The flow field must change direction across the lane. Edudojo's lanes are wide enough for the
      // plain 0.011; a narrow lane (56px here) would get one direction, and the dots would pile up at its wall.
      const flowX = 0.011 * Math.max(1, 200 / w);
      const forming = mine && shape !== null && (phase === 'gather' || phase === 'hold');
      const releasing = mine && shape !== null && phase === 'release';
      const flowing = shape !== null && shape.trailPath.length > 0 && (phase === 'hold' || releasing);
      if (mine && flowing) lane.flow += k * 16.67;
      for (let i = 0; i < lane.n; i++) {
        let vx = lane.vx[i];
        let vy = lane.vy[i];
        const x = lane.x[i];
        const y = lane.y[i];
        const t = lane.target[i];
        const dxm = mx - x;
        const dym = my - y;
        const dm = Math.sqrt(dxm * dxm + dym * dym) || 1;
        let weight = 0;
        let held = false;

        if (t >= 0 && shape && (forming || (releasing && !lane.free[i]))) {
          const delay = shape.order[t] * STAGGER_MS;
          if (forming) {
            weight = phase === 'hold' ? 1 : smooth((elapsed - delay) / SETTLE_MS);
            held = elapsed > delay || phase === 'hold';
          } else if (elapsed > delay * 0.6) {
            // Release in stroke order too: the figure dissolves the way it was drawn.
            lane.free[i] = 1;
            const cx = shape.x[t] - lane.cx;
            const cy = shape.y[t] - lane.cy;
            const d = Math.sqrt(cx * cx + cy * cy) || 1;
            // Strong enough to spread the dots through the whole lane again, so no cloud lingers.
            const speed = 0.8 + Math.random() * 1.4;
            const turn = (Math.random() - 0.5) * 1.2;
            vx += ((cx * Math.cos(turn) - cy * Math.sin(turn)) / d) * speed;
            vy += ((cx * Math.sin(turn) + cy * Math.cos(turn)) / d) * speed * 1.6;
          } else {
            held = true;
            weight = 1;
          }
        }

        let trailS = -1;
        if (held && shape && t >= 0 && flowing && shape.trail[t] >= 0) {
          // The page keeps shedding: trail dots flow slowly away from it and start again at its edge.
          // They are placed, not sprung, so the wrap from the faint far end back to the page is invisible.
          trailS = (shape.trail[t] + lane.flow / TRAIL_CYCLE_MS) % 1;
          trailPoint(shape, trailS, shape.trailOff[t], scratch);
          vx = (scratch[0] - x) / k;
          vy = (scratch[1] - y) / k;
        } else if (held && shape && t >= 0) {
          // An underdamped spring: a gentle overshoot as each dot lands. Holding, the figure shimmers.
          const shimmer = phase === 'hold' || releasing ? 0.35 : 0;
          const tx = shape.x[t] + Math.sin(now * 0.0011 + lane.seed[i]) * shimmer;
          const ty = shape.y[t] + Math.cos(now * 0.0009 + lane.seed[i] * 1.3) * shimmer;
          vx += (tx - x) * 0.016 * k;
          vy += (ty - y) * 0.016 * k;
          if (dm < 50) {
            vx -= (dxm / dm) * 0.12 * k;
            vy -= (dym / dm) * 0.12 * k;
          }
          vx *= damp;
          vy *= damp;
          const sp = Math.sqrt(vx * vx + vy * vy);
          if (sp > 4) {
            vx = (vx / sp) * 4;
            vy = (vy / sp) * 4;
          }
        } else {
          // A slow flow field: neighbours move together, so the margin breathes instead of jittering.
          const a = (Math.sin(x * flowX + now * 0.0001 + lane.seed[i] * 0.08) + Math.cos(y * 0.0055 - now * 0.00007)) * Math.PI;
          vx += (Math.cos(a) * 0.14 - vx) * 0.02 * k;
          vy += (Math.sin(a) * 0.14 - vy) * 0.02 * k;
          if (dm < 150) {
            // Drawn gently towards the cursor, but kept a little apart from it.
            const pull = dm > 34 ? 0.01 * (1 - dm / 150) : -0.03;
            vx += (dxm / dm) * pull * k;
            vy += (dym / dm) * pull * k;
          }
          if (lane.free[i]) {
            vx *= 0.985;
            vy *= 0.985;
          }
        }

        let nx = x + vx * k;
        let ny = y + vy * k;
        if (trailS >= 0 && vx * vx + vy * vy > 4) {
          // A wrap back to the page edge moves the dot but must not leave it with a jump's speed.
          vx = 0;
          vy = 0;
        }
        if (nx < 1) vx += 0.03 * k;
        else if (nx > w - 1) vx -= 0.03 * k;
        if (ny < TOP_SAFE) vy += 0.03 * k;
        else if (ny > h - BOTTOM_PAD) vy -= 0.03 * k;
        nx = nx < 0 ? 0 : nx > w ? w : nx;
        ny = ny < TOP_SAFE ? TOP_SAFE : ny > h ? h : ny;
        lane.x[i] = nx;
        lane.y[i] = ny;
        lane.vx[i] = vx;
        lane.vy[i] = vy;

        // What to draw: blend from the drifting dot to the symbol dot it is becoming.
        let alpha = lane.a[i] * breath;
        let radius = lane.r[i];
        let tone = 0;
        if (weight > 0 && shape && t >= 0) {
          let ta = trailS >= 0 ? trailAlpha(trailS) : shape.alpha[t];
          if (phase === 'hold') ta *= 0.9 + 0.1 * Math.sin(now * 0.0016 + lane.seed[i] * 3);
          alpha += (ta - alpha) * weight;
          radius += ((trailS >= 0 ? trailSize(trailS) : shape.size[t]) - radius) * weight;
          // The accent turns green only once it has landed, so no green dot flies across the margin.
          if (shape.leaf[t] && weight > 0.5 && (nx - shape.x[t]) ** 2 + (ny - shape.y[t]) ** 2 < 4) tone = 1;
        }
        lane.drawA[i] = alpha;
        lane.drawR[i] = radius;
        lane.key[i] = batchKey(tone, alpha);
      }
    };

    /** Batched render: a counting sort by (tone, alpha bucket), then one path and one fill per batch. */
    const render = (lane: Lane) => {
      const ctx = lane.ctx;
      if (!ctx) return;
      ctx.clearRect(0, 0, lane.box.w, lane.box.h);
      const { counts, order, key } = lane;
      counts.fill(0);
      for (let i = 0; i < lane.n; i++) counts[key[i] + 1]++;
      for (let c = 1; c <= KEYS; c++) counts[c] += counts[c - 1];
      for (let i = 0; i < lane.n; i++) order[counts[key[i]]++] = i;
      let start = 0;
      for (let c = 0; c < KEYS; c++) {
        const end = counts[c];
        if (end > start) {
          const tone = Math.floor(c / BUCKETS);
          ctx.fillStyle = tone === 1 ? palette.leaf : palette.ink;
          ctx.globalAlpha = (((c % BUCKETS) + 0.5) / BUCKETS) * MAX_ALPHA;
          ctx.beginPath();
          for (let j = start; j < end; j++) {
            const i = order[j];
            const r = lane.drawR[i];
            ctx.rect(lane.x[i] - r, lane.y[i] - r, r * 2, r * 2);
          }
          ctx.fill();
        }
        start = end;
      }
      ctx.globalAlpha = 1;
    };

    const readAnchors = (): Anchor[] => {
      const found: Anchor[] = [];
      for (const entry of entries) {
        // Missing ids are skipped, so a content edit never breaks the margins.
        const el = document.getElementById(entry.id);
        if (!el) continue;
        // The element itself, not its section: the caller names exactly the line a symbol belongs to.
        found.push({ top: el.getBoundingClientRect().top + window.scrollY, symbol: entry.symbol });
      }
      return found.sort((a, b) => a.top - b.top);
    };

    const readingSymbol = (): MarginSymbol => {
      const vh = window.innerHeight;
      // At the very bottom the reading line can never reach the last section, so count what is on screen.
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      return symbolAt(anchors, window.scrollY + vh * (atEnd ? 0.95 : READING_LINE)) ?? entries[0].symbol;
    };

    /**
     * Reduced motion: one still, stippled symbol in one margin for the section in view, redrawn only
     * when the section changes, never animated. The symbol is kept (not hidden) because it carries the
     * page's structure, and a still picture asks nothing of a reader who wants no movement.
     */
    const drawStill = () => {
      if (!active || !left || !right) return;
      const symbol = readingSymbol();
      const index = Math.max(0, entries.findIndex((entry) => entry.symbol === symbol));
      const laneIndex = index % 2;
      const lane = lanes()[laneIndex];
      const box = symbolBox(lane.box, sideName(laneIndex));
      const nextKey = `${symbol}|${laneIndex}|${lane.box.w}|${palette.ink}`;
      if (nextKey === stillKey) return;
      stillKey = nextKey;
      lanes().forEach((l) => l.ctx?.clearRect(0, 0, l.box.w, l.box.h));
      const shape = stippleSymbol(symbol, box, symbolBudget(particleCount(lane.box), box.w), { side: sideName(laneIndex) });
      lane.n = shape.count;
      for (let k = 0; k < shape.count; k++) {
        lane.x[k] = shape.x[k];
        lane.y[k] = shape.y[k];
        lane.drawR[k] = shape.size[k];
        lane.drawA[k] = shape.alpha[k] * 0.85;
        lane.key[k] = batchKey(shape.leaf[k] ? 1 : 0, lane.drawA[k]);
      }
      render(lane);
    };

    const tick = (now: number) => {
      frame = 0;
      if (!active || reduced || document.hidden || !onScreen || !left || !right) return;
      // 30fps is plenty for slow drift, and halves the cost on wide screens (thousands of particles).
      // The physics scales with elapsed time, so motion keeps its speed.
      if (last && now - last < MARGIN_FRAME_MS) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const k = last ? Math.min((now - last) / 16.67, 3) : 1;
      last = now;
      let elapsed = now - phaseStart;
      const current = readingSymbol();
      const pair = [left, right];
      const lane = pair[side];

      if (phase === 'drift' && (elapsed > DRIFT_MS || (current !== formed && elapsed > DRIFT_MIN_MS))) {
        const box = symbolBox(lane.box, sideName(side));
        assign(lane, stippleSymbol(current, box, symbolBudget(lane.n, box.w), { side: sideName(side) }), box);
        formed = current;
        phase = 'gather';
        phaseStart = now;
      } else if (phase === 'gather' && elapsed > GATHER_MS) {
        phase = 'hold';
        phaseStart = now;
      } else if (phase === 'hold' && (elapsed > HOLD_MS || (current !== formed && elapsed > HOLD_MIN_MS))) {
        // The reader moved on: let this figure go sooner, so the next one belongs to what they read.
        phase = 'release';
        phaseStart = now;
      } else if (phase === 'release' && elapsed > RELEASE_MS) {
        lane.target.fill(-1);
        lane.free.fill(0);
        lane.shape = null;
        side = 1 - side;
        phase = 'drift';
        phaseStart = now;
      }
      elapsed = now - phaseStart;

      const breath = 0.86 + 0.14 * Math.sin(now / 2600);
      for (let i = 0; i < 2; i++) {
        step(pair[i], now, k, i === side, elapsed, breath);
        render(pair[i]);
      }
      frame = requestAnimationFrame(tick);
    };

    const canRun = () => active && !reduced && !document.hidden && onScreen && !disposed;
    const start = () => {
      if (frame || !canRun()) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onScroll = () => {
      if (reduced) drawStill();
    };
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -1e4;
      mouseY = -1e4;
    };
    // Pointer and scroll listeners exist only while the margins can show.
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        document.documentElement.addEventListener('mouseleave', onLeave);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMove, { passive: true });
      } else {
        document.documentElement.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('mousemove', onMove);
      }
    };

    const measure = () => {
      if (disposed) return;
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;
      const column = document.querySelector<HTMLElement>(columnSelector);
      let found: ReturnType<typeof computeLanes> = null;
      if (column) {
        // The content box: the column's rect without its horizontal padding, so the margins are the
        // space the text really leaves free.
        const rect = column.getBoundingClientRect();
        const style = getComputedStyle(column);
        const columnLeft = rect.left + (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.borderLeftWidth) || 0);
        const columnRight = rect.right - (parseFloat(style.paddingRight) || 0) - (parseFloat(style.borderRightWidth) || 0);
        if (rect.width > 0) found = computeLanes({ viewportWidth: vw, viewportHeight: vh, columnLeft, columnRight });
      }
      if (!found) {
        active = false;
        stop();
        listen(false);
        for (const lane of lanes()) lane.canvas.style.display = 'none';
        return;
      }
      if (!left || !right) {
        left = createLane();
        right = createLane();
        document.body.append(left.canvas, right.canvas);
      }
      anchors = readAnchors();
      active = true;
      listen(true);
      placeLane(left, found.left);
      placeLane(right, found.right);
      if (reduced) {
        stillKey = '';
        drawStill();
      } else {
        start();
      }
    };

    const onReducedChange = () => {
      reduced = reducedQuery?.matches ?? false;
      stop();
      // Reset the lanes, so the next measure reseeds them (the still symbol reused the arrays).
      for (const lane of lanes()) {
        lane.box = { x: 0, y: 0, w: 0, h: 0 };
        lane.shape = null;
        lane.ctx?.clearRect(0, 0, lane.canvas.width, lane.canvas.height);
      }
      phase = 'drift';
      phaseStart = performance.now();
      measure();
    };
    const onTheme = () => {
      palette = readPalette();
      if (reduced) {
        stillKey = '';
        drawStill();
      }
    };

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => measure()) : null;
    const observedColumn = document.querySelector<HTMLElement>(columnSelector);
    if (observedColumn) resizeObserver?.observe(observedColumn);
    // The page is always on screen unless its column has scrolled away (a transition, a tall embed).
    const intersectionObserver =
      typeof IntersectionObserver === 'function' && observedColumn
        ? new IntersectionObserver((records) => {
            onScreen = records.some((record) => record.isIntersecting);
            if (onScreen) start();
            else stop();
          })
        : null;
    if (observedColumn) intersectionObserver?.observe(observedColumn);
    const themeObserver = typeof MutationObserver === 'function' ? new MutationObserver(onTheme) : null;
    themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    reducedQuery?.addEventListener('change', onReducedChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', measure, { passive: true });
    phaseStart = performance.now();
    measure();

    return () => {
      disposed = true;
      stop();
      listen(false);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      themeObserver?.disconnect();
      reducedQuery?.removeEventListener('change', onReducedChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', measure);
      left?.canvas.remove();
      right?.canvas.remove();
    };
  }, [sectionsKey, columnSelector]);

  // Nothing to render: the canvases are appended to <body>, where no transformed or clipped ancestor
  // can change what `position: fixed` means.
  return null;
}
