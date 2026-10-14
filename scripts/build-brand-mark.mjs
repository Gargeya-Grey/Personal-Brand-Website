// Builds every file of the site's mark from one geometry (see DESIGN.md, "The mark").
// Ink dots gather, growing, into the G's stroke; the stroke turns into the bar; the bar ends in a
// papaya dot. Run: node scripts/build-brand-mark.mjs
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const INK = { light: '#1B1A18', dark: '#EEECE8' };
const PAPER = { light: '#F7F6F3', dark: '#121110' };
const PAPAYA = '#FF8000';

// The full cut reads from 48px up; the small cut (fewer, larger dots) holds at 16px.
const FULL = { n: 8, gap: 8, fuseAt: -180, drift: 22 };
const SMALL = { n: 4, gap: 16, fuseAt: -175, drift: 10, minR: 17, w: 74, stopR: 34, grow: 2 };

const round = (n) => Number(n.toFixed(2));
const rad = (deg) => (deg * Math.PI) / 180;

/** The mark's shapes on a 480 grid. `inkAttr` is the attribute pair that colours ink shapes. */
function markShapes(inkAttr, options = {}) {
  const {
    cx = 238, cy = 240, r = 140, w = 68,
    fuseAt = -190, gap = 9, n = 7, minR = 7, drift = 30, grow = 1.3,
    barIn = 42, stopGap = 14, stopR = 31,
  } = options;
  const { fill, stroke } = inkAttr;
  const shapes = [];
  // The solid stroke: from the fuse point counter-clockwise to the right, then the bar inward.
  const startX = cx + r * Math.cos(rad(fuseAt));
  const startY = cy + r * Math.sin(rad(fuseAt));
  const largeArc = fuseAt < -180 ? 0 : 1;
  shapes.push(`<path d="M${round(startX)} ${round(startY)}A${r} ${r} 0 ${largeArc} 0 ${round(cx + r)} ${cy}H${round(cx + barIn)}" ${stroke} stroke-width="${w}" fill="none"/>`);
  shapes.push(`<circle cx="${round(startX)}" cy="${round(startY)}" r="${w / 2}" ${fill}/>`);
  // The dots, walking clockwise from the stroke toward the upper terminal: each smaller, drifting
  // outward, with equal gaps between neighbours.
  let previous = { x: startX, y: startY, radius: w / 2, deg: fuseAt };
  for (let i = 0; i < n; i++) {
    const k = (i + 1) / n;
    const radius = w / 2 - (w / 2 - minR) * Math.pow(k, 1 / grow);
    const offset = drift * Math.pow(k, 1.8);
    let deg = previous.deg;
    let x = 0;
    let y = 0;
    do {
      deg += 0.1;
      x = cx + (r + offset) * Math.cos(rad(deg));
      y = cy + (r + offset) * Math.sin(rad(deg));
    } while (Math.hypot(x - previous.x, y - previous.y) < previous.radius + radius + gap);
    shapes.push(`<circle cx="${round(x)}" cy="${round(y)}" r="${round(radius)}" ${fill}/>`);
    previous = { x, y, radius, deg };
  }
  // The last step: a papaya dot after the bar.
  shapes.push(`<circle cx="${round(cx + barIn - stopGap - stopR)}" cy="${cy}" r="${stopR}" fill="${PAPAYA}"/>`);
  return shapes.join('');
}

const inkColour = (hex) => ({ fill: `fill="${hex}"`, stroke: `stroke="${hex}"` });

/** Offset that centres the shapes' bounding box on the 480 grid, measured from a render. */
async function centringOffset(cut) {
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" fill="#fff"/>${markShapes(inkColour('#000'), cut).replace(PAPAYA, '#000')}</svg>`;
  const { info } = await sharp(Buffer.from(probe)).trim({ background: '#fff', threshold: 10 }).toBuffer({ resolveWithObject: true });
  return [240 - (-info.trimOffsetLeft + info.width / 2), 240 - (-info.trimOffsetTop + info.height / 2)];
}

function svgFile(shapes, [ox, oy], { tile, scale = 1 } = {}) {
  const tx = round(240 - 240 * scale + ox * scale);
  const ty = round(240 - 240 * scale + oy * scale);
  const background = tile ? `<rect width="480" height="480" fill="${tile}"/>` : '';
  return `<svg width="480" height="480" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">${background}<g transform="translate(${tx} ${ty}) scale(${scale})">${shapes}</g></svg>\n`;
}

async function writeWithPng(path, svg) {
  writeFileSync(path, svg);
  await sharp(Buffer.from(svg), { density: 384 }).resize(1920, 1920).png().toFile(path.replace(/\.svg$/, '.png'));
}

const fullOffset = await centringOffset(FULL);
const smallOffset = await centringOffset(SMALL);

// Masked (transparent) for the header: light = dark ink for light pages.
await writeWithPng('public/brand/sgargeya-logo-light-mask.svg', svgFile(markShapes(inkColour(INK.light), FULL), fullOffset));
await writeWithPng('public/brand/sgargeya-logo-dark-mask.svg', svgFile(markShapes(inkColour(INK.dark), FULL), fullOffset));
// Tiles for downloads and schema, with a calm margin.
const lightTile = svgFile(markShapes(inkColour(INK.light), FULL), fullOffset, { tile: PAPER.light, scale: 0.8 });
const darkTile = svgFile(markShapes(inkColour(INK.dark), FULL), fullOffset, { tile: PAPER.dark, scale: 0.8 });
await writeWithPng('public/brand/sgargeya-logo-light.svg', lightTile);
await writeWithPng('public/brand/sgargeya-logo-dark.svg', darkTile);
await sharp(Buffer.from(darkTile), { density: 384 }).resize(1920, 1920).png().toFile('app/apple-icon.png');

// Favicon: the small cut, no tile; the ink follows the browser's theme.
const faviconShapes = markShapes({ fill: 'class="g"', stroke: 'class="s"' }, SMALL);
writeFileSync(
  'app/icon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" fill="none">
  <!-- The mark, small cut (built by scripts/build-brand-mark.mjs). No tile; the ink follows the browser's theme. -->
  <style>
    .g { fill: ${INK.light}; } .s { stroke: ${INK.light}; }
    @media (prefers-color-scheme: dark) { .g { fill: ${INK.dark}; } .s { stroke: ${INK.dark}; } }
  </style>
  <g transform="translate(${round(smallOffset[0])} ${round(smallOffset[1])})">${faviconShapes}</g>
</svg>
`,
);
console.log('Mark written: public/brand/*, app/icon.svg, app/apple-icon.png');
