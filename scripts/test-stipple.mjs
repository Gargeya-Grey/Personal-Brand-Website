import assert from 'node:assert/strict';
import {
  GLYPH_NAMES,
  GLYPH_OPACITIES,
  GLYPH_RADII_PX,
  GLYPH_VIEWBOX,
  MARGIN_SYMBOLS,
  MIN_MARGIN,
  TOP_SAFE,
  WORD_ALPHA_LEVELS,
  WORD_GATHER_MS,
  WORD_MAX_DOTS,
  WORD_MIN_SPACING,
  WORD_POINTER_PUSH,
  WORD_POINTER_RADIUS,
  WORD_TRAVEL_MS,
  WORD_WAVE_PERIOD_MS,
  buildGlyphLayers,
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
  computeLanes,
  glyphDotBudget,
  glyphLayers,
  glyphMarkupBytes,
  particleCount,
  stippleSymbol,
  symbolAt,
  symbolBox,
  symbolBudget,
} from '../lib/stipple.ts';

const SIZES = [32, 48, 56, 64, 72, 88, 120, 160, 176];
const total = (layers) => layers.reduce((sum, layer) => sum + layer.paths.reduce((n, path) => n + path.dots.length, 0), 0);
const flat = (layers) => layers.flatMap((layer) => layer.paths.map((path) => `${layer.leaf ? 'L' : 'I'}${layer.level}@${path.order}:${path.d}`));
const NUMBER = String.raw`-?(?:\d+\.?\d*|\.\d+)`;
/** Reads the path data back into dots: the path must be only absolute/relative moves with zero-length lines. */
const parsePath = (d) => {
  const dots = [];
  const re = new RegExp(`([Mm])(${NUMBER}) ?(${NUMBER})h0`, 'y');
  let x = 0;
  let y = 0;
  let at = 0;
  while (at < d.length) {
    re.lastIndex = at;
    const m = re.exec(d);
    assert.ok(m, `path data is only moves and zero-length lines (at ${at}: ${d.slice(at, at + 20)})`);
    assert.equal(m[1] === 'M', at === 0, 'one absolute move, first; relative moves after');
    x = Math.round((m[1] === 'M' ? 0 : x) * 100) / 100 + Number(m[2]);
    y = Math.round((m[1] === 'M' ? 0 : y) * 100) / 100 + Number(m[3]);
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;
    dots.push({ x, y });
    at = re.lastIndex;
  }
  return dots;
};

// The names match the contract: 12 glyphs and 5 margin-only symbols.
assert.equal(GLYPH_NAMES.length, 12);
assert.equal(MARGIN_SYMBOLS.length, 17);
assert.equal(new Set(MARGIN_SYMBOLS).size, 17);

// Determinism: the same name gives the same dots, run after run (no Math.random behind a glyph).
for (const name of MARGIN_SYMBOLS) {
  for (const size of SIZES) {
    assert.deepEqual(buildGlyphLayers(name, size), buildGlyphLayers(name, size), `${name} at ${size}px must be deterministic`);
  }
  const box = { x: 3, y: 5, w: 60, h: 70 };
  const a = stippleSymbol(name, box, 300);
  const b = stippleSymbol(name, box, 300);
  for (const key of ['x', 'y', 'size', 'alpha', 'order', 'leaf', 'trail', 'trailOff', 'trailPath']) {
    assert.deepEqual(a[key], b[key], `${name}.${key} must be deterministic`);
  }
  assert.equal(glyphLayers(name, 64), glyphLayers(name, 64), 'the cached glyph is reused');
}

// Different names look different.
const fingerprints = new Set(MARGIN_SYMBOLS.map((name) => flat(buildGlyphLayers(name, 64)).join('|')));
assert.equal(fingerprints.size, MARGIN_SYMBOLS.length, 'every glyph has its own dots');

// The dot budget follows the area: 64px about 266, 88px about 500, 176px the 1100 cap, never under 120.
assert.equal(glyphDotBudget(10), 120);
assert.ok(Math.abs(glyphDotBudget(64) - 266) <= 2 && Math.abs(glyphDotBudget(88) - 503) <= 3);
assert.equal(glyphDotBudget(176), 1100);
assert.equal(glyphDotBudget(500), 1100);
for (let i = 1; i < SIZES.length; i++) assert.ok(glyphDotBudget(SIZES[i]) >= glyphDotBudget(SIZES[i - 1]), 'budget never shrinks with size');

// Every glyph and margin symbol at every size: non-empty, on budget, inside its viewBox (dot edges
// included), the same dot radius in CSS px at every size, path data that reads back to the dots.
for (const name of MARGIN_SYMBOLS) {
  for (const size of SIZES) {
    const layers = buildGlyphLayers(name, size);
    const count = total(layers);
    const budget = glyphDotBudget(size);
    assert.ok(count >= budget * 0.6 && count <= budget, `${name} at ${size}px has ${count} dots, budget ${budget}`);
    let leaf = 0;
    for (const layer of layers) {
      assert.equal(layer.opacity, GLYPH_OPACITIES[layer.level], `${name}: opacity follows the level`);
      // Radius in CSS px = half the stroke width in viewBox units, scaled to the glyph size.
      const radiusPx = ((layer.width / 2) * size) / GLYPH_VIEWBOX;
      assert.ok(Math.abs(radiusPx - GLYPH_RADII_PX[layer.level]) <= 0.03, `${name} at ${size}px: level ${layer.level} radius is ${radiusPx}px, want ${GLYPH_RADII_PX[layer.level]}px`);
      assert.ok(radiusPx >= 0.5 && radiusPx <= 1.3, `${name} at ${size}px: dot radius ${radiusPx}px stays fine`);
      const r = layer.width / 2;
      for (const path of layer.paths) {
        assert.ok(path.order >= 0 && path.order <= 1);
        assert.ok(path.dots.length > 0);
        assert.deepEqual(parsePath(path.d), path.dots.length ? flatSorted(path) : [], `${name}: path data reads back to its dots`);
        if (layer.leaf) leaf += path.dots.length;
        for (const { x, y } of path.dots) {
          assert.ok(x - r >= -1e-9 && x + r <= GLYPH_VIEWBOX + 1e-9, `${name} at ${size}px: x ${x} (r ${r}) is inside the viewBox`);
          assert.ok(y - r >= -1e-9 && y + r <= GLYPH_VIEWBOX + 1e-9, `${name} at ${size}px: y ${y} (r ${r}) is inside the viewBox`);
          assert.equal(x, Math.round(x * 100) / 100, 'two decimals');
          assert.equal(y, Math.round(y * 100) / 100, 'two decimals');
        }
      }
    }
    assert.ok(leaf <= count * 0.12 + 3, `${name} at ${size}px: the leaf stays one small accent (${leaf} of ${count})`);
    // Every glyph shows its accent from 48px up (at 32px the page's one-dot accent can fall to the subset).
    if (GLYPH_NAMES.includes(name) && size >= 48) assert.ok(leaf >= 1, `${name} at ${size}px has its leaf accent`);
  }
}
/** The dots of a path in the order its data lists them (rows, as `dotsToPath` sorts them). */
function flatSorted(path) {
  return [...path.dots].sort((a, b) => {
    const rowA = Math.floor(a.y / 3);
    const rowB = Math.floor(b.y / 3);
    if (rowA !== rowB) return rowA - rowB;
    return rowA % 2 ? b.x - a.x : a.x - b.x;
  });
}

// Markup weight (an upper bound of the SVG text): under 6 KB at 64px, under 25 KB at 176px.
for (const name of GLYPH_NAMES) {
  const at64 = glyphMarkupBytes(glyphLayers(name, 64));
  const at88 = glyphMarkupBytes(glyphLayers(name, 88));
  const at176 = glyphMarkupBytes(glyphLayers(name, 176));
  assert.ok(at64 < 6000, `${name} at 64px is ${at64} bytes`);
  assert.ok(at88 < 11000, `${name} at 88px is ${at88} bytes`);
  assert.ok(at176 < 25000, `${name} at 176px is ${at176} bytes`);
}

// Margin symbols in a lane-sized box, both sides: every dot inside the box, alpha quiet.
for (const name of MARGIN_SYMBOLS) {
  for (const side of ['left', 'right']) {
    const box = { x: 12, y: 130, w: 56, h: 64.4 };
    const shape = stippleSymbol(name, box, 250, { side });
    assert.ok(shape.count > 0 && shape.count <= 250, `${name}/${side} gives ${shape.count} dots`);
    for (let i = 0; i < shape.count; i++) {
      assert.ok(shape.x[i] >= box.x - 1e-3 && shape.x[i] <= box.x + box.w + 1e-3, `${name}/${side}: x in box`);
      assert.ok(shape.y[i] >= box.y - 1e-3 && shape.y[i] <= box.y + box.h + 1e-3, `${name}/${side}: y in box`);
      assert.ok(shape.alpha[i] > 0 && shape.alpha[i] <= 0.6 + 1e-6, `${name}: alpha stays quiet`);
      assert.ok(shape.order[i] >= 0 && shape.order[i] <= 1);
    }
  }
}

// The page (and the journal) shed a trail; the left margin mirrors the trail, never the page itself.
const pageRight = stippleSymbol('page', { x: 0, y: 0, w: 100, h: 100 }, 300, { side: 'right' });
const pageLeft = stippleSymbol('page', { x: 0, y: 0, w: 100, h: 100 }, 300, { side: 'left' });
assert.ok(pageRight.trailPath.length > 0 && pageLeft.trailPath.length > 0, 'the page has a trail');
assert.ok(pageRight.trailPath[pageRight.trailPath.length - 2] > 50, 'right margin: the trail leaves to the right');
assert.ok(pageLeft.trailPath[pageLeft.trailPath.length - 2] < 50, 'left margin: the trail leaves to the left');
assert.equal(stippleSymbol('torii', { x: 0, y: 0, w: 60, h: 60 }, 200).trailPath.length, 0, 'torii has no trail');

// Lanes. The site's column is 1320px wide with 44px padding: the content box is 104px from each edge at 1440px.
const columnAt = (viewportWidth) => {
  const border = Math.max(0, (viewportWidth - 1320) / 2);
  const width = Math.min(1320, viewportWidth);
  return { columnLeft: border + 44, columnRight: border + width - 44 };
};
const wide = computeLanes({ viewportWidth: 1440, viewportHeight: 900, ...columnAt(1440) });
assert.ok(wide, 'two lanes at 1440x900');
assert.ok(wide.left.w > 24 && wide.right.w > 24, 'both lanes are wide enough for a figure');
assert.ok(wide.left.x >= 12 && wide.left.x + wide.left.w <= 104, 'left lane stays in the left margin');
assert.ok(wide.right.x >= 1336 && wide.right.x + wide.right.w <= 1440 - 12, 'right lane stays in the right margin');
assert.equal(wide.left.h, 900);
// A classic 15px scrollbar leaves a 96.5px margin; that is still alive.
assert.ok(computeLanes({ viewportWidth: 1425, viewportHeight: 900, ...columnAt(1425) }), 'alive with a classic scrollbar');
// Every smaller window has no lanes: laptops at 1280, tablets, phones.
for (const vw of [1366, 1280, 1024, 820, 768, 390]) {
  assert.equal(computeLanes({ viewportWidth: vw, viewportHeight: 900, ...columnAt(vw) }), null, `no lanes at ${vw}px`);
}
// The minimum margin itself: one pixel under on either side gives nothing.
assert.ok(computeLanes({ viewportWidth: 1000, viewportHeight: 900, columnLeft: MIN_MARGIN, columnRight: 1000 - MIN_MARGIN }));
assert.equal(computeLanes({ viewportWidth: 1000, viewportHeight: 900, columnLeft: MIN_MARGIN - 1, columnRight: 1000 - MIN_MARGIN }), null);
assert.equal(computeLanes({ viewportWidth: 1000, viewportHeight: 900, columnLeft: MIN_MARGIN, columnRight: 1000 - MIN_MARGIN + 1 }), null);
assert.equal(computeLanes({ viewportWidth: 1440, viewportHeight: TOP_SAFE + 120, ...columnAt(1440) }), null, 'a viewport too short for the header gap');
assert.equal(computeLanes({ viewportWidth: 1440, viewportHeight: 900, columnLeft: Number.NaN, columnRight: 1336 }), null, 'NaN never makes lanes');
// Wide screens: the lane grows, but never touches the column or the screen edge.
const huge = computeLanes({ viewportWidth: 2560, viewportHeight: 1300, ...columnAt(2560) });
assert.ok(huge && huge.left.x >= 12 && huge.left.x + huge.left.w < columnAt(2560).columnLeft);
assert.ok(huge.right.x > columnAt(2560).columnRight && huge.right.x + huge.right.w <= 2560 - 12);

// Symbol box and particle budgets.
const box = symbolBox(wide.right, 'right');
assert.ok(box.x >= 0 && box.x + box.w <= wide.right.w, 'the symbol fits its lane');
assert.ok(box.y >= TOP_SAFE, 'the symbol sits below the header');
assert.ok(box.y + box.h <= wide.right.h);
assert.ok(particleCount(wide.right) >= 400 && particleCount(huge.right) <= 3600);
// The lanes reach the screen edge (EDGE_PAD from it), and a 2560px screen is as dense as a 1920px one.
assert.equal(huge.left.x, 12);
assert.equal(huge.right.x + huge.right.w, 2560 - 12);
assert.ok(huge.left.w > 550 && huge.left.w < 650, `2560px lanes are about 600px wide (${huge.left.w})`);
const fullHd = computeLanes({ viewportWidth: 1920, viewportHeight: 1080, ...columnAt(1920) });
const density = (lane) => particleCount(lane) / (lane.w * lane.h);
assert.ok(Math.abs(density(huge.left) / density(fullHd.left) - 1) < 0.3, 'a 2560px screen keeps the density of a 1920px one');
assert.ok(symbolBudget(particleCount(wide.right), box.w) <= Math.floor(particleCount(wide.right) * 0.8));
assert.equal(symbolBudget(2200, 160), 720);
assert.ok(symbolBudget(2200, 56) < 720);

// The reading line: the last section whose top it has passed.
const anchors = [
  { top: 0, symbol: 'torii' },
  { top: 800, symbol: 'page' },
  { top: 1600, symbol: 'path' },
];
assert.equal(symbolAt(anchors, -10), 'torii');
assert.equal(symbolAt(anchors, 900), 'page');
assert.equal(symbolAt(anchors, 99999), 'path');
assert.equal(symbolAt([], 100), null);

// Wordmark. A synthetic mask: two inked bars (a stand-in for letters) on a 400x140 sheet.
const MASK_W = 400;
const MASK_H = 140;
const mask = new Uint8ClampedArray(MASK_W * MASK_H * 4);
const inBars = (x, y) => y >= 40 && y < 100 && ((x >= 40 && x < 120) || (x >= 200 && x < 330));
for (let y = 0; y < MASK_H; y++) for (let x = 0; x < MASK_W; x++) if (inBars(x, y)) mask[(y * MASK_W + x) * 4 + 3] = 255;
assert.equal(inkedPixels(mask, MASK_W, MASK_H), 60 * 80 + 60 * 130);

// Spacing: the tightest allowed, and wider only when the dots would pass the cap.
assert.equal(wordSpacing(12600), WORD_MIN_SPACING);
const hugeArea = 120000;
const bigSpacing = wordSpacing(hugeArea);
assert.ok(bigSpacing > WORD_MIN_SPACING && bigSpacing <= 4.2, `a big word gets spacing ${bigSpacing}`);
assert.ok(Math.round(hugeArea / (bigSpacing * bigSpacing * 0.866)) <= WORD_MAX_DOTS * 1.03, 'spacing keeps the grid under the cap');

// Sampling: deterministic, inside the inked bars (an edge dot may sit under one spacing outside), capped.
const grainA = sampleWord(mask, MASK_W, MASK_H, WORD_MIN_SPACING, 7);
const grainB = sampleWord(mask, MASK_W, MASK_H, WORD_MIN_SPACING, 7);
assert.deepEqual(grainA.x, grainB.x);
assert.deepEqual(grainA.y, grainB.y);
assert.notDeepEqual(sampleWord(mask, MASK_W, MASK_H, WORD_MIN_SPACING, 8).x, grainA.x, 'another seed, another grain');
const expected = 12600 / (WORD_MIN_SPACING * WORD_MIN_SPACING * 0.866);
assert.ok(grainA.x.length > expected * 0.85 && grainA.x.length < expected * 1.15, `${grainA.x.length} dots, about ${Math.round(expected)}`);
for (let i = 0; i < grainA.x.length; i++) assert.ok(inBars(Math.floor(grainA.x[i]), Math.floor(grainA.y[i])), 'every dot rests on a letter');
const few = sampleWord(mask, MASK_W, MASK_H, WORD_MIN_SPACING, 7, 300);
assert.equal(few.x.length, 300, 'the cap thins the dots');
assert.deepEqual(few.x, sampleWord(mask, MASK_W, MASK_H, WORD_MIN_SPACING, 7, 300).x, 'the thinning is deterministic');
assert.ok(few.x.every((x, i) => inBars(Math.floor(x), Math.floor(few.y[i]))));
// The thinned dots stay spread over both bars (a cap must not eat one letter).
assert.ok(few.x.some((x) => x < 130) && few.x.some((x) => x > 190));

// Dots: deterministic, grouped, fine, scattered close to home, left to right in time, done in about 1.6s.
const dotsA = buildWordDots(grainA, MASK_W, 7);
assert.deepEqual(dotsA, buildWordDots(grainA, MASK_W, 7));
assert.equal(dotsA.count, grainA.x.length);
assert.equal(dotsA.start[dotsA.start.length - 1], dotsA.count);
for (let g = 0; g <= WORD_ALPHA_LEVELS; g++) {
  for (let i = dotsA.start[g]; i < dotsA.start[g + 1]; i++) assert.equal(dotsA.group[i], g, 'sorted by group');
}
const leafDots = dotsA.start[WORD_ALPHA_LEVELS + 1] - dotsA.start[WORD_ALPHA_LEVELS];
assert.ok(leafDots >= 1 && leafDots <= dotsA.count * 0.015, `${leafDots} leaf dots of ${dotsA.count}`);
let early = 0;
let late = 0;
let nearCount = 0;
let lateCount = 0;
for (let i = 0; i < dotsA.count; i++) {
  assert.ok(dotsA.r[i] >= 0.7 - 1e-6 && dotsA.r[i] <= 1.3 + 1e-6, 'radius 0.7 to 1.3px');
  assert.ok(Math.abs(dotsA.sx[i] - dotsA.x[i]) <= 28 + 1e-3, 'scatter stays near the word');
  const lift = dotsA.sy[i] - dotsA.y[i];
  assert.ok(lift >= -28 - 1e-3 && lift <= 56 + 1e-3, 'scatter is mostly below, a little above');
  assert.ok(dotsA.delay[i] >= 0 && dotsA.delay[i] + WORD_TRAVEL_MS <= dotsA.end + 1e-3);
  if (dotsA.x[i] < 130) {
    early += dotsA.delay[i];
    nearCount++;
  } else if (dotsA.x[i] > 250) {
    late += dotsA.delay[i];
    lateCount++;
  }
}
assert.ok(late / lateCount > early / nearCount + 150, 'the right side arrives after the left');
assert.ok(dotsA.end <= 1700 && dotsA.end >= 1200, `the gather ends at ${dotsA.end}ms`);
for (let g = 0; g <= WORD_ALPHA_LEVELS; g++) assert.ok(wordAlpha(g) >= 0.6 && wordAlpha(g) <= 1);
assert.ok(wordAlpha(0) < wordAlpha(WORD_ALPHA_LEVELS - 1));

// Gather ease: still before its start, home after the travel, never going back.
assert.equal(gatherEase(-50), 0);
assert.equal(gatherEase(0), 0);
assert.equal(gatherEase(WORD_TRAVEL_MS), 1);
assert.equal(gatherEase(WORD_TRAVEL_MS + 500), 1);
for (let t = 1; t <= WORD_TRAVEL_MS; t += 25) assert.ok(gatherEase(t) >= gatherEase(t - 25));

// Wave: slight (never beyond the peak), a loop (one period later is the same), long (about 1.5 letters).
for (const fontPx of [60, 96, 160, 256, 400]) {
  const wave = waveParams(fontPx);
  assert.ok(wave.amp >= 1.2 && wave.amp <= 2.4, `peak ${wave.amp}px at ${fontPx}px type`);
  const wavelength = (Math.PI * 2) / wave.k;
  assert.ok(Math.abs(wavelength - fontPx * 0.75) < 1e-6);
  let widest = 0;
  for (let i = 0; i < 4000; i++) {
    const x = (i * 7.3) % 1200;
    const t = (i * 41.9) % 20000;
    const y = waveOffset(x, t, wave);
    widest = Math.max(widest, Math.abs(y));
    assert.ok(Math.abs(y) <= wave.amp + 1e-9, 'the wave stays within its peak');
    assert.ok(Math.abs(waveOffset(x, t + WORD_WAVE_PERIOD_MS, wave) - y) < 1e-6, 'the wave loops every period');
  }
  assert.ok(widest > wave.amp * 0.98, 'the wave does reach its peak');
}
assert.equal(WORD_WAVE_PERIOD_MS, 7000);

// Pointer: away from the pointer, strongest close, nothing at the radius, nothing past it.
const out = new Float32Array(2);
pointerPush(WORD_POINTER_RADIUS, 0, WORD_POINTER_RADIUS, WORD_POINTER_PUSH, out);
assert.deepEqual([out[0], out[1]], [0, 0]);
pointerPush(500, -300, WORD_POINTER_RADIUS, WORD_POINTER_PUSH, out);
assert.deepEqual([out[0], out[1]], [0, 0]);
let previous = Infinity;
for (let d = 1; d < WORD_POINTER_RADIUS; d += 3) {
  pointerPush(d * 0.6, d * 0.8, WORD_POINTER_RADIUS, WORD_POINTER_PUSH, out);
  const size = Math.hypot(out[0], out[1]);
  assert.ok(size <= WORD_POINTER_PUSH + 1e-6 && size < previous + 1e-9, 'the push fades with distance');
  assert.ok(out[0] > 0 && out[1] > 0, 'the dot gives way away from the pointer');
  previous = size;
}
pointerPush(0, 0, WORD_POINTER_RADIUS, WORD_POINTER_PUSH, out);
assert.ok(out[1] === -WORD_POINTER_PUSH && out[0] === 0, 'a dot under the pointer gives way upward');
assert.equal(hashText('Gargeya'), hashText('Gargeya'));

console.log('stipple tests passed');

// The wordmark's accent tail: every dot right of the boundary is a leaf dot.
{
  const xs = Float32Array.from([10, 20, 30, 40, 50]);
  const ys = Float32Array.from([5, 5, 5, 5, 5]);
  const dots = buildWordDots({ x: xs, y: ys }, 60, 7, 35);
  const leafGroup = dots.start.length - 2;
  for (let k = 0; k < dots.count; k++) {
    if (dots.x[k] >= 35 && dots.group[k] !== leafGroup) throw new Error('accent tail: dot right of boundary is not leaf');
  }
  console.log('wordmark accent tail ok');
}
