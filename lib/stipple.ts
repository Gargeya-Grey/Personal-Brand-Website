/*
 * Shared stipple engine for the dot figures: the small DotGlyph icons and the MarginDots symbols that
 * gather in the page margins. Ported from Edudojo's MarginPath (same shapes, same stipple), so both
 * sites draw with the same dots. Framework-free on purpose: no React, no DOM, so a plain node script
 * can test it and the server can render glyphs from it.
 *
 * Every figure is a list of primitives in unit space ([-1, 1] on both axes, y down). `stippleSymbol`
 * turns them into dots, like an engraving: strokes are dense with larger, darker dots at the centre;
 * fills are sparser; a soft light from the upper left gives the figure a little depth.
 */

export type GlyphName =
  | 'edudojo' | 'odicto' | 'twinaatma' | 'dataclean' | 'box-lab' | 'idea-mixer' | 'evals' | 'personal-brand'
  | 'research' | 'journal' | 'notes' | 'films' | 'social';
export type MarginSymbol = GlyphName | 'torii' | 'page' | 'path' | 'graph' | 'ginkgo';

export const GLYPH_NAMES: readonly GlyphName[] = [
  'edudojo', 'odicto', 'twinaatma', 'dataclean', 'box-lab', 'idea-mixer', 'evals', 'personal-brand',
  'research', 'journal', 'notes', 'films', 'social',
];
export const MARGIN_SYMBOLS: readonly MarginSymbol[] = [...GLYPH_NAMES, 'torii', 'page', 'path', 'graph', 'ginkgo'];

export type Side = 'left' | 'right';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/* ── Margin lanes ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Free margin each side needs before the particles appear. Edudojo uses 100. This site's column is
 * 1320px with 44px padding, so a 1440px window leaves 104px of content margin, but a classic 15px
 * scrollbar takes it to 96.5px. 88 keeps that common desktop case alive; below it (every tablet and
 * phone) the margins are too narrow for a figure and nothing is drawn.
 */
export const MIN_MARGIN = 88;
/** Least clear space between a lane and the content column. */
export const COLUMN_CLEARANCE = 28;
/** Space between a lane and the viewport edge. */
export const EDGE_PAD = 12;
/** Lane width before it reaches toward the screen edge (see OUTER_GAP_KEEP); keeps it near the column, like marginalia. */
export const MAX_LANE = 240;
/**
 * Share of the gap between a MAX_LANE lane and the screen edge that the lane fills. 1 means the lane
 * reaches EDGE_PAD from the edge: the particles spread to the edge of the screen (the owner asked for it).
 */
export const OUTER_GAP_KEEP = 1;
/** Particles stay below the fixed header bar (about 96px tall). */
export const TOP_SAFE = 96;
export const BOTTOM_PAD = 16;
/** Where in the viewport the reader "is": a little below the middle. */
export const READING_LINE = 0.55;
export const MIN_PARTICLES = 400;
/** High enough that a wide lane (a 2560px screen, lanes about 600px wide) keeps the density of a 1920px one. */
export const MAX_PARTICLES = 3600;
/** Share of a lane's particles that form a symbol; the rest keep drifting around it. */
export const SYMBOL_SHARE = 0.8;
/** Dots of the largest symbol (160px wide); smaller symbols get fewer, so the stipple keeps its grain. */
export const SYMBOL_MAX_DOTS = 720;
/** Brightest a particle gets: the margins stay quiet. */
export const MAX_ALPHA = 0.6;

export interface LaneInput {
  /** Viewport width without the scrollbar. */
  viewportWidth: number;
  viewportHeight: number;
  /** Left and right edges of the content column's content box, in viewport coordinates. */
  columnLeft: number;
  columnRight: number;
}

export interface Lanes {
  left: Box;
  right: Box;
}

/** Wider margins get more clear space, because large display type can overhang the column edge. */
function clearance(margin: number): number {
  return Math.max(COLUMN_CLEARANCE, Math.min(56, margin * 0.14));
}

/** The two margin lanes in viewport coordinates, or null when either margin is too narrow. */
export function computeLanes(input: LaneInput): Lanes | null {
  const { viewportWidth: vw, viewportHeight: vh, columnLeft, columnRight } = input;
  const rightMargin = vw - columnRight;
  if (!(columnLeft >= MIN_MARGIN) || !(rightMargin >= MIN_MARGIN) || vh <= TOP_SAFE + 120) return null;
  const leftInner = columnLeft - clearance(columnLeft);
  // The lane reaches half of the way from MAX_LANE toward the screen edge: no wide empty strip at the
  // edge, but still clear of it, and wide enough that it never reads as a narrow vertical bar.
  const leftCap = leftInner - MAX_LANE;
  const leftOuter = Math.max(EDGE_PAD, leftCap - (leftCap - EDGE_PAD) * OUTER_GAP_KEEP);
  const rightInner = columnRight + clearance(rightMargin);
  const rightCap = rightInner + MAX_LANE;
  const rightOuter = Math.min(vw - EDGE_PAD, rightCap + (vw - EDGE_PAD - rightCap) * OUTER_GAP_KEEP);
  return {
    left: { x: leftOuter, y: 0, w: leftInner - leftOuter, h: vh },
    right: { x: rightInner, y: 0, w: rightOuter - rightInner, h: vh },
  };
}

/** Space kept between a symbol and the lane's outer edge. */
const SYMBOL_PAD = 4;

/**
 * Where a symbol sits inside a lane (lane coordinates): small, a little above the middle, and biased
 * toward the outer edge of the margin so it never pulls the eye toward the text.
 */
export function symbolBox(lane: Pick<Box, 'w' | 'h'>, side: Side): Box {
  const w = Math.max(24, Math.min(lane.w - SYMBOL_PAD * 2, 160));
  const h = w * 1.15;
  const cy = Math.min(Math.max(lane.h * 0.42, TOP_SAFE + h / 2 + 8), lane.h - h / 2 - BOTTOM_PAD);
  const outerCentre = side === 'left' ? lane.w * 0.38 : lane.w * 0.62;
  const cx = Math.min(Math.max(outerCentre, SYMBOL_PAD + w / 2), lane.w - SYMBOL_PAD - w / 2);
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Lane area per particle (px²). 220 keeps the lanes that now reach the screen edge from looking sparse. */
const PARTICLE_AREA = 220;

/** Particles per margin: dense enough to stipple a figure, scaled to the lane's area. */
export function particleCount(lane: Pick<Box, 'w' | 'h'>): number {
  return Math.round(Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, (lane.w * lane.h) / PARTICLE_AREA)));
}

/** Dots a lane of `n` particles gives to a symbol `width` px wide. */
export function symbolBudget(n: number, width: number): number {
  const byWidth = Math.min(SYMBOL_MAX_DOTS, Math.max(120, Math.round(width * 4.5)));
  return Math.min(Math.floor(n * SYMBOL_SHARE), byWidth);
}

export interface Anchor {
  /** Top of the section, in document coordinates. */
  top: number;
  symbol: MarginSymbol;
}

/** The symbol of the last section whose top the reading line has passed (the first one before any). */
export function symbolAt(anchors: readonly Anchor[], y: number): MarginSymbol | null {
  let symbol: MarginSymbol | null = anchors[0]?.symbol ?? null;
  for (const a of anchors) if (a.top <= y) symbol = a.symbol;
  return symbol;
}

/* ── Trail: a curve the stipple loosens along (the page shedding dots) ─────────────────────────── */

/** A stippled figure: one entry per dot, in the box's coordinates. */
export interface SymbolShape {
  count: number;
  x: Float32Array;
  y: Float32Array;
  /** Dot radius in box units (0.5 to 1.1 before the radius option). */
  size: Float32Array;
  alpha: Float32Array;
  /** 0 to 1: when the dot arrives, in drawing order along the strokes. */
  order: Float32Array;
  /** 1 for the few leaf-green accent dots. */
  leaf: Uint8Array;
  /** Position along the trail (0 at the page, 1 at its end) for trail dots; -1 for every other dot. */
  trail: Float32Array;
  /** Where a trail dot sits across the trail, -1 to 1. */
  trailOff: Float32Array;
  /** The trail's centre line, sampled evenly, flat [x0, y0, ...]; empty without a trail. */
  trailPath: Float32Array;
  /** Units per half-box, so the trail's width can be worked out again while it flows. */
  trailScale: number;
}

/** Trail dots fade and shrink as they leave the page; the far end is only a few scattered dots. */
export function trailAlpha(s: number): number {
  const c = s < 0 ? 0 : s > 1 ? 1 : s;
  return 0.46 * (1 - c) ** 1.25;
}
export function trailSize(s: number): number {
  const c = s < 0 ? 0 : s > 1 ? 1 : s;
  return 0.5 + 0.5 * (1 - c) ** 1.2;
}
/** Half-width of the trail in units: it loosens as it goes. */
function trailHalfWidth(s: number): number {
  return 0.025 + 0.11 * s;
}

/** Writes the trail point at `s` (0..1) and offset `off` (-1..1) into `out`, without allocating. */
export function trailPoint(
  shape: Pick<SymbolShape, 'trailPath' | 'trailScale'>,
  s: number,
  off: number,
  out: Float32Array,
): void {
  const path = shape.trailPath;
  const last = path.length / 2 - 1;
  const f = Math.min(Math.max(s, 0), 1) * last;
  const i = Math.min(Math.floor(f), last - 1);
  const t = f - i;
  const x0 = path[i * 2];
  const y0 = path[i * 2 + 1];
  const dx = path[i * 2 + 2] - x0;
  const dy = path[i * 2 + 3] - y0;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const w = trailHalfWidth(s) * shape.trailScale * off;
  out[0] = x0 + dx * t - (dy / d) * w;
  out[1] = y0 + dy * t + (dx / d) * w;
}

/* ── Primitives and the shape library ──────────────────────────────────────────────────────────── */

interface Stroke {
  kind: 'stroke';
  /** Flat [u0, v0, u1, v1, ...]. */
  pts: number[];
  width: number;
  alpha: number;
  leaf?: boolean;
}
interface Disc {
  kind: 'disc';
  u: number;
  v: number;
  r: number;
  alpha: number;
  leaf?: boolean;
  /** Mirrored to the margin's outer side, with a trail. */
  outward?: boolean;
}
interface Poly {
  kind: 'poly';
  pts: number[];
  alpha: number;
  /** Fill density against the default; above 1 reads as a denser region (an overlap). */
  density?: number;
}
/** A cubic curve the stipple loosens along; `share` is its part of the dot budget. */
interface Trail {
  kind: 'trail';
  /** Four control points, flat [u0, v0, ..., u3, v3]. */
  pts: number[];
  share: number;
}
type Prim = Stroke | Disc | Poly | Trail;

const stroke = (pts: number[], width: number, alpha = 0.44, leaf = false): Stroke => ({ kind: 'stroke', pts, width, alpha, leaf });
const disc = (u: number, v: number, r: number, alpha = 0.42, leaf = false): Disc => ({ kind: 'disc', u, v, r, alpha, leaf });
const poly = (pts: number[], alpha: number, density = 1): Poly => ({ kind: 'poly', pts, alpha, density });

/** Samples a curve f(t), t in [0, 1], into a flat point list. */
function curve(n: number, f: (t: number) => [number, number]): number[] {
  const pts: number[] = [];
  for (let i = 0; i < n; i++) pts.push(...f(i / (n - 1)));
  return pts;
}

function arc(cu: number, cv: number, r: number, from: number, to: number, n = 40): number[] {
  return curve(n, (t) => {
    const a = from + (to - from) * t;
    return [cu + Math.cos(a) * r, cv + Math.sin(a) * r];
  });
}

/** A closed circle outline (last point repeats the first). */
const circle = (cu: number, cv: number, r: number, n = 40): number[] => arc(cu, cv, r, 0, Math.PI * 2, n);

/** A closed rectangle outline. */
const rect = (l: number, t: number, r: number, b: number): number[] => [l, t, r, t, r, b, l, b, l, t];

/** A straight segment between two nodes, shortened so it meets their edges. */
function link(a: [number, number], b: [number, number], gap: number, width: number, alpha: number): Stroke {
  const du = b[0] - a[0];
  const dv = b[1] - a[1];
  const d = Math.hypot(du, dv) || 1;
  return stroke([a[0] + (du / d) * gap, a[1] + (dv / d) * gap, b[0] - (du / d) * gap, b[1] - (dv / d) * gap], width, alpha);
}

/** Scales a figure about the origin by `s` and moves it by (du, dv), widths included. */
function place(prims: Prim[], s: number, du: number, dv: number): Prim[] {
  const move = (pts: number[]) => pts.map((value, i) => value * s + (i % 2 ? dv : du));
  return prims.map((p): Prim => {
    if (p.kind === 'stroke') return { ...p, pts: move(p.pts), width: p.width * s };
    if (p.kind === 'disc') return { ...p, u: p.u * s + du, v: p.v * s + dv, r: p.r * s };
    return { ...p, pts: move(p.pts) };
  });
}

// The logo: an upturned top beam, a second beam, a tie beam, a small plaque, two leaning pillars.
const toriiPrims = (): Prim[] => [
  stroke(curve(32, (t) => {
    const u = -0.96 + t * 1.92;
    return [u, -0.76 - 0.16 * Math.abs(u / 0.96) ** 3];
  }), 0.13, 0.5),
  stroke([-0.84, -0.58, 0.84, -0.58], 0.06, 0.4),
  stroke([-0.8, -0.28, 0.8, -0.28], 0.08, 0.44),
  stroke([0, -0.56, 0, -0.3], 0.07, 0.36),
  stroke([-0.55, -0.6, -0.62, 0.96], 0.12, 0.46),
  stroke([0.55, -0.6, 0.62, 0.96], 0.12, 0.46),
  disc(0, -0.43, 0.07, 0.7, true),
];

// A finished page coming apart into a trail of dots: the answer turning back into its process.
// u grows toward the margin's outer side (the stippler mirrors only the trail for the left margin).
const pagePrims = (): Prim[] => {
  const [l, r, t, b, fold] = [-0.6, 0.5, -0.95, 0.3, 0.2];
  const outline = [r - fold, t, l, t, l, b, r, b, r, t + fold * 1.1, r - fold, t];
  const lineEnds = [0.36, 0.26, 0.38, 0.18, 0.32, 0.02];
  return [
    poly(outline.slice(0, -2), 0.08),
    stroke(outline, 0.035, 0.44),
    stroke([r - fold, t, r - fold, t + fold * 1.1, r, t + fold * 1.1], 0.025, 0.36),
    stroke([-0.46, -0.76, -0.02, -0.76], 0.075, 0.54),
    ...lineEnds.map((end, i) => {
      const v = -0.56 + i * 0.145;
      return stroke([-0.46, v, end, v], 0.05, 0.48);
    }),
    { kind: 'trail', pts: [0.4, 0.33, 0.62, 0.48, 0.58, 0.7, 0.82, 0.84], share: 0.22 },
    { ...disc(0.86, 0.94, 0.02, 0.7, true), outward: true },
  ];
};

const SHAPES: Record<MarginSymbol, () => Prim[]> = {
  torii: toriiPrims,
  page: pagePrims,
  // Draft, question, draft: three nodes on one path down the margin.
  path: () => {
    const nodes: [number, number][] = [
      [-0.42, -0.7],
      [0.4, 0],
      [-0.42, 0.7],
    ];
    return [
      ...nodes.map(([u, v]) => disc(u, v, 0.13, 0.42)),
      ...nodes.map(([u, v]) => stroke(circle(u, v, 0.22, 36), 0.03, 0.3)),
      link(nodes[0], nodes[1], 0.26, 0.035, 0.3),
      link(nodes[1], nodes[2], 0.26, 0.035, 0.3),
      disc(0.4, 0, 0.07, 0.75, true),
    ];
  },
  // A connected graph of reasoning, with one claim off the line: the flaw the Red Team finds.
  graph: () => {
    const n: [number, number][] = [
      [-0.55, -0.72],
      [0.25, -0.8],
      [0.7, -0.2],
      [0.1, 0.08],
      [-0.62, 0.02],
      [-0.2, 0.66],
      [0.72, 0.8],
    ];
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 4],
      [4, 3],
      [4, 5],
      [3, 5],
      [1, 3],
    ];
    return [
      ...edges.map(([i, j]) => link(n[i], n[j], 0.12, 0.028, 0.28)),
      ...n.map(([u, v]) => disc(u, v, 0.09, 0.44)),
      stroke(circle(0.72, 0.8, 0.16, 30), 0.02, 0.24),
    ];
  },
  // A ginkgo leaf: a filled fan with its notch, fine veins, a stem.
  ginkgo: () => {
    const base: [number, number] = [0, 0.36];
    const rim = curve(40, (t) => {
      const a = Math.PI * (1.1 + t * 0.8);
      const r = 1 - 0.2 * Math.exp(-(((t - 0.5) / 0.06) ** 2));
      return [Math.cos(a) * r * 0.92, base[1] + Math.sin(a) * r];
    });
    const veins: Prim[] = [];
    for (let i = 1; i < 8; i++) {
      const j = Math.round((i / 8) * 39) * 2;
      veins.push(stroke([base[0], base[1], rim[j] * 0.94, base[1] + (rim[j + 1] - base[1]) * 0.94], 0.018, 0.26));
    }
    return [
      poly([...base, ...rim], 0.22),
      stroke(rim, 0.05, 0.46),
      stroke([...base, rim[0], rim[1]], 0.04, 0.42),
      stroke([...base, rim[78], rim[79]], 0.04, 0.42),
      ...veins,
      stroke([0, 0.36, 0.06, 0.96], 0.05, 0.44),
      disc(0, 0.38, 0.07, 0.75, true),
    ];
  },

  /* Product and section glyphs. One subject each, drawn with fine-dot strokes like Edudojo's figures.
     Fills are only a sparse, faint tint; a leaf accent is one small cluster, and only where it means something. */

  // The gate, a little smaller and lifted, standing on three steps.
  edudojo: () => [
    ...place(toriiPrims(), 0.8, 0, -0.17),
    stroke([-0.46, 0.68, 0.46, 0.68], 0.05, 0.44),
    stroke([-0.6, 0.82, 0.6, 0.82], 0.05, 0.44),
    stroke([-0.74, 0.96, 0.74, 0.96], 0.05, 0.44),
  ],
  // A voice waveform that dies down on the left and resolves into three lines of text on the right.
  odicto: () => {
    const heights = [0.28, 0.62, 0.86, 0.58, 0.34, 0.16];
    return [
      ...heights.map((h, i) => stroke([-0.92 + i * 0.16, -h, -0.92 + i * 0.16, h], 0.055, 0.46)),
      stroke([0.14, -0.4, 0.88, -0.4], 0.075, 0.5),
      stroke([0.14, 0, 0.74, 0], 0.075, 0.5),
      stroke([0.14, 0.4, 0.52, 0.4], 0.075, 0.5),
      disc(0.68, 0.4, 0.07, 0.75, true),
    ];
  },
  // Three memory layers stacked; the middle one carries the leaf: the approved memory.
  twinaatma: () => {
    const layer = (v: number): Prim[] => {
      const outline = [0, v - 0.2, 0.82, v, 0, v + 0.2, -0.82, v, 0, v - 0.2];
      return [poly(outline.slice(0, -2), 0.14, 0.5), stroke(outline, 0.05, 0.5)];
    };
    return [...layer(0.56), ...layer(0), ...layer(-0.56), disc(0, 0, 0.08, 0.8, true)];
  },
  // Rows that wander on the left and stand in order on the right.
  dataclean: () => [
    stroke([-0.92, -0.62, -0.74, -0.74, -0.54, -0.58, -0.34, -0.72, -0.16, -0.62], 0.055, 0.38),
    stroke([-0.84, -0.14, -0.64, -0.28, -0.44, -0.16, -0.22, -0.3], 0.055, 0.38),
    stroke([-0.92, 0.3, -0.7, 0.16, -0.48, 0.3, -0.3, 0.2, -0.12, 0.28], 0.055, 0.38),
    stroke([-0.8, 0.6, -0.52, 0.74, -0.26, 0.64], 0.055, 0.38),
    stroke([-0.06, -0.16, 0.1, 0, -0.06, 0.16], 0.055, 0.5),
    stroke([0.26, -0.66, 0.92, -0.66], 0.065, 0.5),
    stroke([0.26, -0.22, 0.92, -0.22], 0.065, 0.5),
    stroke([0.26, 0.22, 0.92, 0.22], 0.065, 0.5),
    stroke([0.26, 0.66, 0.92, 0.66], 0.065, 0.5),
    disc(0.86, 0.66, 0.06, 0.8, true),
  ],
  // Two boxes overlap; the overlap is a small box of its own, with a denser tint.
  'box-lab': () => [
    poly(rect(-0.84, -0.72, 0.16, 0.3).slice(0, -2), 0.1, 0.4),
    poly(rect(-0.16, -0.3, 0.84, 0.72).slice(0, -2), 0.1, 0.4),
    poly(rect(-0.16, -0.3, 0.16, 0.3).slice(0, -2), 0.24, 1),
    stroke(rect(-0.84, -0.72, 0.16, 0.3), 0.045, 0.48),
    stroke(rect(-0.16, -0.3, 0.84, 0.72), 0.045, 0.48),
    stroke(rect(-0.16, -0.3, 0.16, 0.3), 0.03, 0.4),
    disc(0, 0, 0.055, 0.8, true),
  ],
  // Two different forms, a circle and a triangle, with a small plus where they meet.
  'idea-mixer': () => [
    poly(circle(-0.56, 0, 0.36, 28).slice(0, -2), 0.1, 0.4),
    stroke(circle(-0.56, 0, 0.36), 0.05, 0.5),
    poly([0.56, -0.4, 0.92, 0.3, 0.2, 0.3], 0.1, 0.4),
    stroke([0.56, -0.4, 0.92, 0.3, 0.2, 0.3, 0.56, -0.4], 0.05, 0.5),
    stroke([-0.12, 0, 0.12, 0], 0.06, 0.8, true),
    stroke([0, -0.12, 0, 0.12], 0.06, 0.8, true),
  ],
  // Two parallel scales; the markers stand at the same point on both.
  evals: () => {
    const ticks: Prim[] = [];
    for (let k = -4; k <= 4; k += 2) {
      for (const u of [-0.46, 0.46]) ticks.push(stroke([u - 0.2, k * 0.19, u + 0.2, k * 0.19], 0.035, 0.38));
    }
    return [
      stroke([-0.46, -0.84, -0.46, 0.84], 0.04, 0.5),
      stroke([0.46, -0.84, 0.46, 0.84], 0.04, 0.5),
      ...ticks,
      stroke([-0.34, -0.19, 0.34, -0.19], 0.025, 0.3),
      stroke(circle(-0.46, -0.19, 0.12, 28), 0.035, 0.6),
      stroke(circle(0.46, -0.19, 0.12, 28), 0.035, 0.6),
      disc(-0.46, -0.19, 0.03, 0.7),
      disc(0.46, -0.19, 0.05, 0.85, true),
    ];
  },
  // An open book joined to one small node above it: a person and where they connect.
  'personal-brand': () => {
    const slope = 0.13 / 0.92;
    const leftLeaf = [-0.95, -0.05, -0.03, 0.08, -0.03, 0.92, -0.95, 0.79, -0.95, -0.05];
    const rightLeaf = [0.03, 0.08, 0.95, -0.05, 0.95, 0.79, 0.03, 0.92, 0.03, 0.08];
    const left = (b: number): Prim => stroke([-0.8, b + slope * 0.15, -0.2, b + slope * 0.75], 0.04, 0.44);
    const right = (b: number): Prim => stroke([0.2, b + slope * 0.75, 0.8, b + slope * 0.15], 0.04, 0.44);
    return [
      stroke(leftLeaf, 0.04, 0.5),
      stroke(rightLeaf, 0.04, 0.5),
      left(0.26), left(0.46), left(0.66),
      right(0.26), right(0.46), right(0.66),
      stroke([0, -0.4, 0, 0.06], 0.03, 0.4),
      stroke(circle(0, -0.62, 0.2, 32), 0.035, 0.5),
      disc(0, -0.62, 0.06, 0.8, true),
    ];
  },
  // A lens over a crack: through the glass the crack is wider and plainer.
  research: () => {
    const crack = [-0.94, -0.18, -0.72, -0.06, -0.56, -0.2, -0.42, -0.04, -0.22, -0.18, -0.06, 0.04, 0.1, -0.14, 0.22, 0.08, 0.32, -0.04, 0.5, 0.1];
    return [
      stroke(crack, 0.028, 0.4),
      stroke(crack.slice(6), 0.055, 0.56),
      stroke(circle(0.14, -0.1, 0.5, 44), 0.05, 0.5),
      stroke([0.5, 0.26, 0.9, 0.82], 0.09, 0.5),
      disc(0.5, 0.1, 0.05, 0.8, true),
    ];
  },
  // The journal is the page, trail of dots included.
  journal: pagePrims,
  // A letter, sealed: the envelope with its flap folded down. The green dot is the seal.
  notes: () => [
    poly(rect(-0.9, -0.52, 0.9, 0.52).slice(0, -2), 0.1, 0.4),
    stroke(rect(-0.9, -0.52, 0.9, 0.52), 0.05, 0.5),
    stroke([-0.9, -0.52, 0, 0.14, 0.9, -0.52], 0.05, 0.5),
    stroke([-0.9, 0.52, -0.3, 0.02], 0.028, 0.32),
    stroke([0.9, 0.52, 0.3, 0.02], 0.028, 0.32),
    disc(0, 0.14, 0.08, 0.8, true),
  ],
  // A film frame with a play triangle; sprocket dots above and below, a recording dot in the corner.
  films: () => {
    const sprockets: Prim[] = [];
    for (let k = 0; k < 7; k++) for (const v of [-0.84, 0.84]) sprockets.push(disc(-0.78 + k * 0.26, v, 0.03, 0.45));
    return [
      ...sprockets,
      stroke(rect(-0.92, -0.62, 0.92, 0.62), 0.05, 0.5),
      poly([-0.2, -0.34, 0.42, 0, -0.2, 0.34], 0.2, 0.6),
      stroke([-0.2, -0.34, 0.42, 0, -0.2, 0.34, -0.2, -0.34], 0.045, 0.5),
      disc(-0.7, -0.4, 0.055, 0.8, true),
    ];
  },
  // Three connected nodes; the top one is the sender, in leaf.
  social: () => {
    const n: [number, number][] = [
      [0, -0.6],
      [-0.66, 0.5],
      [0.66, 0.5],
    ];
    return [
      link(n[0], n[1], 0.27, 0.035, 0.4),
      link(n[0], n[2], 0.27, 0.035, 0.4),
      link(n[1], n[2], 0.27, 0.035, 0.4),
      ...n.map(([u, v]) => stroke(circle(u, v, 0.22, 32), 0.035, 0.5)),
      disc(n[0][0], n[0][1], 0.07, 0.85, true),
      disc(n[1][0], n[1][1], 0.035, 0.6),
      disc(n[2][0], n[2][1], 0.035, 0.6),
    ];
  },
};

/* ── Stippling ─────────────────────────────────────────────────────────────────────────────────── */

/** Small seeded generator, so a figure stipples the same way every time (and in every test). */
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

export function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function inPoly(pts: number[], u: number, v: number): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const ui = pts[i];
    const vi = pts[i + 1];
    const uj = pts[j];
    const vj = pts[j + 1];
    if (vi > v !== vj > v && u < ((uj - ui) * (v - vi)) / (vj - vi) + ui) inside = !inside;
  }
  return inside;
}

/** Fill area is stippled more sparsely than strokes, so outlines stay crisp. */
const FILL_DENSITY = 0.4;

export interface StippleOptions {
  /** Which margin the figure is for: only parts marked `outward` (a trail) mirror. Default 'right'. */
  side?: Side;
  /** Seed override. Default: the symbol name and the box width, so each size has its own fixed grain. */
  seed?: number;
  /** Multiplier on dot radius. Default 1. */
  radius?: number;
}

/**
 * Stipples a symbol into at most `budget` dots inside `box`: strokes are dense with dots that are
 * larger and darker at the stroke's centre; fills are sparser and shaded like a dome; a soft light
 * from the upper left gives the figure a little depth. Same name, box, budget and options always
 * give the same dots.
 */
export function stippleSymbol(name: MarginSymbol, box: Box, budget: number, options: StippleOptions = {}): SymbolShape {
  const prims = SHAPES[name]();
  const radius = options.radius ?? 1;
  // Parts marked `outward` (a trail and its last dot) point to the margin's outer side; the left
  // margin mirrors only those, so a figure itself (a page of text) never reads backwards.
  const outwardFlip = options.side === 'left' ? -1 : 1;
  let flip = 1;
  const rand = mulberry32(options.seed ?? hashText(name) ^ Math.round(box.w * 10));
  const sx = box.w / 2;
  const sy = box.h / 2;
  const scale = Math.min(sx, sy);
  const densityOf = (p: Poly) => FILL_DENSITY * (p.density ?? 1);

  // Spacing that makes the dot count land near the budget.
  let area = 0;
  let strokeLength = 0;
  for (const p of prims) {
    if (p.kind === 'stroke') {
      for (let i = 2; i < p.pts.length; i += 2) {
        const len = Math.hypot((p.pts[i] - p.pts[i - 2]) * sx, (p.pts[i + 1] - p.pts[i - 1]) * sy);
        area += len * Math.max(p.width * scale, 1);
        strokeLength += len;
      }
    } else if (p.kind === 'trail') {
      continue;
    } else if (p.kind === 'disc') {
      area += Math.PI * (p.r * scale) ** 2 * (p.leaf ? 1 : FILL_DENSITY + 0.3);
    } else {
      let a = 0;
      for (let i = 0, j = p.pts.length - 2; i < p.pts.length; j = i, i += 2) a += p.pts[j] * p.pts[i + 1] - p.pts[i] * p.pts[j + 1];
      area += Math.abs(a / 2) * sx * sy * densityOf(p);
    }
  }
  const trailShare = prims.reduce((sum, p) => sum + (p.kind === 'trail' ? p.share : 0), 0);
  const spacing = Math.max(0.8, Math.sqrt(area / Math.max(1, budget * (1 - trailShare))));
  // With a trail, strokes are drawn first and the trail loosens last.
  const strokeSpan = trailShare > 0 ? 0.8 : 1;
  const toX = (u: number) => box.x + (Math.max(-1, Math.min(1, u * flip)) + 1) * sx;
  const toY = (v: number) => box.y + (Math.max(-1, Math.min(1, v)) + 1) * sy;

  const xs: number[] = [];
  const ys: number[] = [];
  const sizes: number[] = [];
  const alphas: number[] = [];
  const orders: number[] = [];
  const leaves: number[] = [];
  const trails: number[] = [];
  const trailOffs: number[] = [];
  const light = (u: number, v: number) => 0.82 - 0.12 * (u + v) * 0.5;
  const push = (u: number, v: number, depth: number, alpha: number, order: number, leaf: boolean) => {
    xs.push(toX(u));
    ys.push(toY(v));
    sizes.push((0.5 + 0.6 * depth * (0.7 + 0.3 * rand())) * radius);
    alphas.push(Math.min(MAX_ALPHA, alpha * (0.5 + 0.5 * depth) * light(u * flip, v)));
    orders.push(Math.min(1, Math.max(0, order)));
    leaves.push(leaf ? 1 : 0);
    trails.push(-1);
    trailOffs.push(0);
  };

  const TRAIL_SAMPLES = 33;
  const trailPath = new Float32Array(trailShare > 0 ? TRAIL_SAMPLES * 2 : 0);
  const scratch = new Float32Array(2);

  let travelled = 0;
  for (const p of prims) {
    flip = p.kind === 'trail' || (p.kind === 'disc' && p.outward) ? outwardFlip : 1;
    if (p.kind === 'stroke') {
      const widthPx = Math.max(p.width * scale, 1);
      const across = Math.max(1, Math.round(widthPx / spacing));
      for (let i = 2; i < p.pts.length; i += 2) {
        const u0 = p.pts[i - 2];
        const v0 = p.pts[i - 1];
        const du = p.pts[i] - u0;
        const dv = p.pts[i + 1] - v0;
        const len = Math.hypot(du * sx, dv * sy);
        const nu = (-dv * sy) / (len || 1) / sx;
        const nv = (du * sx) / (len || 1) / sy;
        const steps = Math.max(1, Math.round(len / spacing));
        for (let s = 0; s < steps; s++) {
          const t = (s + rand()) / steps;
          for (let j = 0; j < across; j++) {
            // Across the stroke: evenly spread with jitter, so edges feather instead of ending hard.
            const off = ((j + 0.5) / across - 0.5 + (rand() - 0.5) / across) * widthPx;
            const depth = 1 - Math.min(1, Math.abs(off) / (widthPx / 2 + 0.5));
            const u = u0 + du * t + nu * off;
            const v = v0 + dv * t + nv * off;
            push(u, v, depth, p.alpha, ((travelled + len * t) / Math.max(1, strokeLength)) * strokeSpan, Boolean(p.leaf));
          }
        }
        travelled += len;
      }
    } else if (p.kind === 'disc') {
      const rPx = p.r * scale;
      const step = spacing / Math.sqrt(p.leaf ? 1 : FILL_DENSITY + 0.3);
      for (let gy = -rPx; gy <= rPx; gy += step) {
        for (let gx = -rPx; gx <= rPx; gx += step) {
          const jx = gx + (rand() - 0.5) * step;
          const jy = gy + (rand() - 0.5) * step;
          const d = Math.hypot(jx, jy) / Math.max(rPx, 0.5);
          if (d > 1) continue;
          // Shaded like a small sphere: denser and darker toward the centre.
          push(p.u + jx / sx, p.v + jy / sy, 1 - d * 0.7, p.alpha, 0.55 + 0.45 * d * rand(), Boolean(p.leaf));
        }
      }
      if (rPx < step) push(p.u, p.v, 1, p.alpha, p.leaf && trailShare > 0 ? 1 : 0.6, Boolean(p.leaf));
    } else if (p.kind === 'trail') {
      const [u0, v0, u1, v1, u2, v2, u3, v3] = p.pts;
      for (let i = 0; i < TRAIL_SAMPLES; i++) {
        const t = i / (TRAIL_SAMPLES - 1);
        const m = 1 - t;
        trailPath[i * 2] = toX(m * m * m * u0 + 3 * m * m * t * u1 + 3 * m * t * t * u2 + t * t * t * u3);
        trailPath[i * 2 + 1] = toY(m * m * m * v0 + 3 * m * m * t * v1 + 3 * m * t * t * v2 + t * t * t * v3);
      }
      const view = { trailPath, trailScale: scale };
      const count = Math.round(budget * p.share);
      for (let j = 0; j < count; j++) {
        const st = (j + rand()) / count;
        // Two uniform draws: most dots near the centre line, a few loose at its edges.
        const off = rand() + rand() - 1;
        trailPoint(view, st, off, scratch);
        // The loose edge of the trail may not leave the box (a glyph's viewBox clips there).
        xs.push(Math.min(box.x + box.w, Math.max(box.x, scratch[0])));
        ys.push(Math.min(box.y + box.h, Math.max(box.y, scratch[1])));
        sizes.push(trailSize(st) * radius);
        alphas.push(trailAlpha(st));
        orders.push(0.8 + 0.2 * st);
        leaves.push(0);
        trails.push(st);
        trailOffs.push(off);
      }
    } else {
      let minU = 1;
      let maxU = -1;
      let minV = 1;
      let maxV = -1;
      for (let i = 0; i < p.pts.length; i += 2) {
        minU = Math.min(minU, p.pts[i]);
        maxU = Math.max(maxU, p.pts[i]);
        minV = Math.min(minV, p.pts[i + 1]);
        maxV = Math.max(maxV, p.pts[i + 1]);
      }
      const step = spacing / Math.sqrt(densityOf(p));
      for (let y = minV * sy; y <= maxV * sy; y += step) {
        for (let x = minU * sx; x <= maxU * sx; x += step) {
          const u = (x + (rand() - 0.5) * step) / sx;
          const v = (y + (rand() - 0.5) * step) / sy;
          if (!inPoly(p.pts, u, v)) continue;
          const toBase = Math.hypot(u - p.pts[0], v - p.pts[1]);
          push(u, v, 0.35 + 0.4 * rand(), p.alpha, (0.35 + 0.6 * Math.min(1, toBase)) * strokeSpan, false);
        }
      }
    }
  }

  // Too many dots: keep a random subset (seeded), so density stays even everywhere.
  let n = xs.length;
  const pick = new Uint32Array(n);
  for (let i = 0; i < n; i++) pick[i] = i;
  if (n > budget) {
    for (let i = 0; i < budget; i++) {
      const j = i + Math.floor(rand() * (n - i));
      const t = pick[i];
      pick[i] = pick[j];
      pick[j] = t;
    }
    n = budget;
  }
  const shape: SymbolShape = {
    count: n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    size: new Float32Array(n),
    alpha: new Float32Array(n),
    order: new Float32Array(n),
    leaf: new Uint8Array(n),
    trail: new Float32Array(n),
    trailOff: new Float32Array(n),
    trailPath,
    trailScale: scale,
  };
  for (let i = 0; i < n; i++) {
    const k = pick[i];
    shape.x[i] = xs[k];
    shape.y[i] = ys[k];
    shape.size[i] = sizes[k];
    shape.alpha[i] = alphas[k];
    shape.order[i] = orders[k];
    shape.leaf[i] = leaves[k];
    shape.trail[i] = trails[k];
    shape.trailOff[i] = trailOffs[k];
  }
  return shape;
}

/* ── Glyphs: a symbol stippled in CSS px, written as a few SVG paths ───────────────────────────── */

/** The glyph's viewBox is square with this side. The SVG scales it to the CSS size. */
export const GLYPH_VIEWBOX = 64;
/** Draw order is cut into this many slots; a slot is one hover-gather delay step. */
export const GLYPH_ORDER_SLOTS = 6;
/** Opacity per tone level. The margin alphas are faint on purpose; a glyph is foreground, so they are lifted. */
export const GLYPH_OPACITIES: readonly number[] = [0.34, 0.55, 0.76, 0.95];
/**
 * Dot radius per tone level, in CSS px. It does not depend on the glyph size: a large glyph gets more
 * dots of the same fineness, never bigger ones (the margins use 0.5 to 1.1px).
 */
export const GLYPH_RADII_PX: readonly number[] = [0.55, 0.72, 0.95, 1.2];
/** Lifts the margin alpha (at most 0.6) to icon strength. */
const GLYPH_ALPHA_GAIN = 2.2;
/** Dots per px² of glyph area: 266 at 64px, about 500 at 88px, 1100 (the cap) from 130px. */
const GLYPH_DENSITY = 0.065;

/**
 * Dots for a glyph shown at `size` CSS px. It follows the area, so a large glyph keeps the grain of a
 * small one: 266 at 64px, 500 at 88px, 1100 at 176px. Never fewer than 120.
 */
export function glyphDotBudget(size: number): number {
  return Math.min(1100, Math.max(120, Math.round(size * size * GLYPH_DENSITY)));
}

export interface GlyphDot {
  x: number;
  y: number;
}

/** The dots of one draw-order slot and tone: one `<path>` of zero-length round-capped segments. */
export interface GlyphPath {
  /** 0 to 1: when the path arrives in the hover gather. */
  order: number;
  /** Where the hover gather starts from, in viewBox units, relative to the resting place. */
  x: number;
  y: number;
  d: string;
  /** The same dots as numbers (viewBox units), for tests. */
  dots: GlyphDot[];
}

/** All dots of one tone level: shared stroke width and opacity, so each path needs no attributes of its own. */
export interface GlyphLayer {
  leaf: boolean;
  level: number;
  /** Dot diameter in viewBox units (the stroke width of the round-capped segments). */
  width: number;
  opacity: number;
  paths: GlyphPath[];
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Number text for SVG path data: no trailing zeros, no leading zero (".5", "-.07"). */
function pathNumber(hundredths: number): string {
  return (hundredths / 100).toString().replace(/^(-?)0\./, '$1.');
}

/**
 * Path data for dots: one absolute move, then relative moves, each followed by a zero-length line.
 * With round caps a zero-length line is a dot of the stroke's diameter. Dots are ordered in rows, so
 * the relative steps stay short.
 */
function dotsToPath(dots: GlyphDot[]): string {
  const rows = [...dots].sort((a, b) => {
    const rowA = Math.floor(a.y / 3);
    const rowB = Math.floor(b.y / 3);
    if (rowA !== rowB) return rowA - rowB;
    return rowA % 2 ? b.x - a.x : a.x - b.x;
  });
  let d = '';
  let px = 0;
  let py = 0;
  rows.forEach((dot, i) => {
    const x = Math.round(dot.x * 100);
    const y = Math.round(dot.y * 100);
    if (i === 0) {
      d += `M${pathNumber(x)} ${pathNumber(y)}h0`;
    } else {
      const dy = pathNumber(y - py);
      d += `m${pathNumber(x - px)}${dy.startsWith('-') ? '' : ' '}${dy}h0`;
    }
    px = x;
    py = y;
  });
  return d;
}

/**
 * The glyph's dots as SVG layers, in drawing order. Pure and deterministic (seeded by name and
 * budget), so the server and the client build identical SVG. The figure is stippled in CSS px, so the
 * grain and the dot radius are the same at every size; coordinates have 2 decimals in the 64-unit
 * viewBox and every dot, edge included, stays inside it. Uncached; `glyphLayers` is the cached entry point.
 */
export function buildGlyphLayers(name: MarginSymbol, size = 64): GlyphLayer[] {
  const budget = glyphDotBudget(size);
  const cacheKey = `${name}:${budget}`;
  const box: Box = { x: 0, y: 0, w: size, h: size };
  const shape = stippleSymbol(name, box, budget, { seed: hashText(cacheKey) });
  const k = GLYPH_VIEWBOX / size;
  const levels = GLYPH_OPACITIES.length;

  // layer key -> slot -> dots
  const layers = new Map<number, { leaf: boolean; level: number; width: number; slots: Map<number, GlyphDot[]> }>();
  for (let i = 0; i < shape.count; i++) {
    const level = Math.min(levels - 1, Math.floor(Math.min(1, shape.alpha[i] * GLYPH_ALPHA_GAIN) * levels));
    const leaf = shape.leaf[i] === 1;
    const width = round2(2 * GLYPH_RADII_PX[level] * k);
    const r = width / 2;
    const slot = Math.min(GLYPH_ORDER_SLOTS - 1, Math.floor(shape.order[i] * GLYPH_ORDER_SLOTS));
    const key = (leaf ? levels : 0) + level;
    let layer = layers.get(key);
    if (!layer) {
      layer = { leaf, level, width, slots: new Map() };
      layers.set(key, layer);
    }
    let dots = layer.slots.get(slot);
    if (!dots) {
      dots = [];
      layer.slots.set(slot, dots);
    }
    // Rounded inward, so the dot's edge cannot cross the viewBox by a rounding step.
    const low = Math.ceil(r * 100) / 100;
    const high = Math.floor((GLYPH_VIEWBOX - r) * 100) / 100;
    dots.push({
      x: Math.min(high, Math.max(low, round2(shape.x[i] * k))),
      y: Math.min(high, Math.max(low, round2(shape.y[i] * k))),
    });
  }

  // The scatter reaches about 3px plus 3% of the size, whatever the size, and is fixed per path.
  const reach = (3 + size * 0.03) * k;
  return [...layers.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, layer]): GlyphLayer => ({
      leaf: layer.leaf,
      level: layer.level,
      width: layer.width,
      opacity: GLYPH_OPACITIES[layer.level],
      paths: [...layer.slots.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([slot, dots]): GlyphPath => {
          const rand = mulberry32(hashText(`${cacheKey}:${layer.leaf ? 'L' : 'I'}${layer.level}:${slot}`));
          const angle = rand() * Math.PI * 2;
          const distance = reach * (0.55 + 0.45 * rand());
          return {
            order: round2(slot / (GLYPH_ORDER_SLOTS - 1)),
            x: Math.round(Math.cos(angle) * distance * 10) / 10,
            y: Math.round(Math.sin(angle) * distance * 10) / 10,
            d: dotsToPath(dots),
            dots,
          };
        }),
    }));
}

const glyphCache = new Map<string, GlyphLayer[]>();

/** `buildGlyphLayers`, remembered per name and size (stroke width and scatter depend on size, not
 * only on the dot budget): a page with many glyphs stipples each once. */
export function glyphLayers(name: MarginSymbol, size = 64): GlyphLayer[] {
  const cacheKey = `${name}:${size}`;
  const cached = glyphCache.get(cacheKey);
  if (cached) return cached;
  const layers = buildGlyphLayers(name, size);
  glyphCache.set(cacheKey, layers);
  return layers;
}

/**
 * Upper bound of the SVG markup in bytes (the path data, plus per-path, per-layer and per-svg
 * overhead as React writes it). SSR output stays under it; the tests hold it to the size targets.
 */
export function glyphMarkupBytes(layers: readonly GlyphLayer[]): number {
  let bytes = 260;
  for (const layer of layers) {
    bytes += 90;
    for (const path of layer.paths) bytes += path.d.length + 70;
  }
  return bytes;
}

/* ── Wordmark: a word drawn in dots that gather, wave and give way to the pointer ─────────────────── */

/** Tightest dot spacing (CSS px). Below it, thin strokes of small type would clot. */
export const WORD_MIN_SPACING = 2.6;
/** Most dots a word may have, so a frame stays cheap at the largest size. */
export const WORD_MAX_DOTS = 9000;
/** Share of the dots in the leaf accent. */
export const WORD_LEAF_SHARE = 0.005;
/** Opacity levels of the ink dots, and the lowest opacity. Dots are batched by level. */
export const WORD_ALPHA_LEVELS = 5;
export const WORD_ALPHA_MIN = 0.6;
/** The dots start to arrive over this window (ms), left to right, and each travels for WORD_TRAVEL_MS: done in about 1.6s. */
export const WORD_GATHER_MS = 900;
export const WORD_TRAVEL_MS = 800;
/** How far from the pointer a dot gives way (CSS px), and the most it moves. */
export const WORD_POINTER_RADIUS = 70;
export const WORD_POINTER_PUSH = 7;
/** One wave period (ms). */
export const WORD_WAVE_PERIOD_MS = 7000;

/** Pixels of a mask (RGBA, `width` x `height`) that are inked. */
export function inkedPixels(rgba: Uint8ClampedArray, width: number, height: number): number {
  let count = 0;
  for (let i = 3; i < width * height * 4; i += 4) if (rgba[i] >= 128) count++;
  return count;
}

/**
 * Dot spacing for a word whose letters cover `inkedArea` CSS px²: the tightest spacing that keeps the
 * dot count under `maxDots` (a row-offset grid has one dot per spacing² x 0.866).
 */
export function wordSpacing(inkedArea: number, minSpacing = WORD_MIN_SPACING, maxDots = WORD_MAX_DOTS): number {
  const fitting = Math.sqrt(inkedArea / (maxDots * 0.866));
  return Math.max(minSpacing, Math.round(fitting * 100) / 100);
}

/**
 * Where the dots rest: a jittered, row-offset grid kept where the mask (1 px per CSS px) is inked.
 * Same mask, spacing and seed always give the same dots. If there are more than `maxDots`, a seeded
 * random subset stays, so the density remains even across the letters.
 */
export function sampleWord(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  spacing: number,
  seed: number,
  maxDots = WORD_MAX_DOTS,
): { x: Float32Array; y: Float32Array } {
  const rand = mulberry32(seed);
  const xs: number[] = [];
  const ys: number[] = [];
  let row = 0;
  for (let gy = spacing / 2; gy < height; gy += spacing * 0.866, row++) {
    const shift = row % 2 ? spacing / 2 : 0;
    for (let gx = spacing / 2 + shift; gx < width; gx += spacing) {
      const x = gx + (rand() - 0.5) * spacing * 0.8;
      const y = gy + (rand() - 0.5) * spacing * 0.8;
      const px = Math.floor(x);
      const py = Math.floor(y);
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      // A dot that straddles an edge stays, so the edge is not eaten away.
      if (rgba[(py * width + px) * 4 + 3] < 40) continue;
      xs.push(x);
      ys.push(y);
    }
  }
  const n = xs.length;
  if (n <= maxDots) return { x: Float32Array.from(xs), y: Float32Array.from(ys) };
  const pick = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i < maxDots; i++) {
    const j = i + Math.floor(rand() * (n - i));
    const t = pick[i];
    pick[i] = pick[j];
    pick[j] = t;
  }
  const kept = pick.slice(0, maxDots).sort((a, b) => a - b);
  return { x: Float32Array.from(kept, (i) => xs[i]), y: Float32Array.from(kept, (i) => ys[i]) };
}

/** A word's dots, sorted by tone and opacity level so a frame is a few fills. */
export interface WordDots {
  count: number;
  /** Resting place. */
  x: Float32Array;
  y: Float32Array;
  /** Where the gather starts. */
  sx: Float32Array;
  sy: Float32Array;
  /** When the dot starts to travel (ms after the gather began). */
  delay: Float32Array;
  /** Radius in CSS px. */
  r: Float32Array;
  /** Group of each dot: ink levels 0 to WORD_ALPHA_LEVELS-1, then the leaf accent. */
  group: Uint8Array;
  /** Group g owns the indices [start[g], start[g+1]). */
  start: Uint32Array;
  /** When the last dot has arrived (ms after the gather began). */
  end: number;
}

/**
 * Gives the resting places their look and their way in: radius and opacity level, a start position
 * scattered mostly below the word (a few around it), a delay that grows from left to right. All seeded.
 * `width` is the width of the sheet the dots were sampled on, in CSS px.
 */
/**
 * `leafFromX`: every dot at or right of this x (CSS px) is a leaf dot, so a trailing mark (the full
 * stop in "Gargeya.") reads in the brand green; the rest keep the rare random leaf accent.
 */
export function buildWordDots(
  points: { x: Float32Array; y: Float32Array },
  width: number,
  seed: number,
  leafFromX = Infinity,
): WordDots {
  const n = points.x.length;
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const groups = WORD_ALPHA_LEVELS + 1;
  const draft = Array.from({ length: n }, (_, i) => {
    const chance = rand();
    const leaf = points.x[i] >= leafFromX || chance < WORD_LEAF_SHARE;
    const level = Math.min(WORD_ALPHA_LEVELS - 1, Math.floor(rand() * WORD_ALPHA_LEVELS));
    const below = rand() > 0.22;
    return {
      i,
      group: leaf ? WORD_ALPHA_LEVELS : level,
      // Fine dots whatever the spacing: 0.7 to 1.3px.
      r: 0.7 + 0.6 * rand(),
      sx: points.x[i] + (rand() - 0.5) * 56,
      sy: points.y[i] + (below ? 8 + rand() * 48 : -rand() * 28),
      delay: (points.x[i] / Math.max(1, width)) * 0.7 * WORD_GATHER_MS + rand() * 0.12 * WORD_GATHER_MS,
    };
  });
  draft.sort((a, b) => a.group - b.group || a.i - b.i);
  const dots: WordDots = {
    count: n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    sx: new Float32Array(n),
    sy: new Float32Array(n),
    delay: new Float32Array(n),
    r: new Float32Array(n),
    group: new Uint8Array(n),
    start: new Uint32Array(groups + 1),
    end: 0,
  };
  draft.forEach((d, k) => {
    dots.x[k] = points.x[d.i];
    dots.y[k] = points.y[d.i];
    dots.sx[k] = d.sx;
    dots.sy[k] = d.sy;
    dots.delay[k] = d.delay;
    dots.r[k] = d.r;
    dots.group[k] = d.group;
    dots.start[d.group + 1]++;
    dots.end = Math.max(dots.end, d.delay + WORD_TRAVEL_MS);
  });
  for (let g = 1; g <= groups; g++) dots.start[g] += dots.start[g - 1];
  return dots;
}

/** Opacity of dot group `g` (ink levels first); the leaf accent is nearly opaque. */
export function wordAlpha(g: number): number {
  if (g >= WORD_ALPHA_LEVELS) return 0.95;
  return WORD_ALPHA_MIN + ((1 - WORD_ALPHA_MIN) * (g + 0.5)) / WORD_ALPHA_LEVELS;
}

export interface WaveParams {
  /** Peak vertical offset, CSS px. */
  amp: number;
  /** Radians per CSS px along x. */
  k: number;
  /** Radians per ms. */
  omega: number;
}

/** A slight wave for type of `fontPx`: peak 1.2 to 2.4px, a wavelength of 0.75em (about 1.5 letters), one period per 7s. */
export function waveParams(fontPx: number): WaveParams {
  return {
    amp: Math.min(2.4, Math.max(1.2, fontPx * 0.0085)),
    k: (Math.PI * 2) / (fontPx * 0.75),
    omega: (Math.PI * 2) / WORD_WAVE_PERIOD_MS,
  };
}

/** Vertical offset of a dot at `x` at time `t` (ms): amp * sin(x*k - t*omega). Never beyond the peak. */
export function waveOffset(x: number, t: number, wave: WaveParams): number {
  return wave.amp * Math.sin(x * wave.k - t * wave.omega);
}

/** 0 to 1 progress of a dot's travel, `elapsed` ms after its own start: ease-out cubic. */
export function gatherEase(elapsed: number): number {
  const c = elapsed <= 0 ? 0 : elapsed >= WORD_TRAVEL_MS ? 1 : elapsed / WORD_TRAVEL_MS;
  return 1 - (1 - c) ** 3;
}

/**
 * How far a dot at (dx, dy) from the pointer gives way: away from it, strongest at the pointer, none at
 * `radius` and beyond (smooth falloff). Writes the offset into `out`.
 */
export function pointerPush(dx: number, dy: number, radius: number, push: number, out: Float32Array): void {
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius) {
    out[0] = 0;
    out[1] = 0;
    return;
  }
  const d = Math.sqrt(d2);
  const f = (1 - d / radius) ** 2 * push;
  // A dot exactly under the pointer has no direction: it gives way upward.
  out[0] = d > 1e-6 ? (dx / d) * f : 0;
  out[1] = d > 1e-6 ? (dy / d) * f : -f;
}
