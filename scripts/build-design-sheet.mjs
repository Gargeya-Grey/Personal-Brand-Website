// Builds the colour and type sheet (docs/design/colour-and-type.html + .pdf) from the live tokens
// in app/field.css, so the sheet never drifts from the site. Contrast ratios are measured, not typed.
// Usage: node scripts/build-design-sheet.mjs   (needs Edge or Chrome for the PDF step)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const css = readFileSync(resolve(root, 'app/field.css'), 'utf8');

function readBlock(selector) {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2].toUpperCase()]));
}
const light = readBlock(':root');
const dark = { ...light, ...readBlock('.dark') };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const roles = [
  ['paper', 'Page background'],
  ['paper-raised', 'The one raised object in a view'],
  ['sage', 'Warm wash: top of the hero, field behind a lead glyph'],
  ['ink', 'Text and headings'],
  ['ink-2', 'Muted text, a heading’s second tone, nav links'],
  ['rule', '1px hairlines between rows and sections'],
  ['forest', 'The anthracite filled button'],
  ['on-forest', 'Text on the filled button'],
  ['leaf', 'McLaren papaya. A signal: dots, last step, focus. Never small text'],
  ['leaf-ink', 'Orange text, link hover'],
  ['clay', 'Crimson. Corrections and warnings only'],
];

const pairs = [
  ['ink', 'paper', 'All text', 4.5],
  ['ink-2', 'paper', 'Muted text', 4.5],
  ['ink', 'sage', 'Text on the wash', 4.5],
  ['leaf-ink', 'paper', 'Orange text, links', 4.5],
  ['clay', 'paper', 'Warnings', 4.5],
  ['on-forest', 'forest', 'Filled button', 4.5],
  ['leaf', 'paper', 'Papaya as a mark', 3],
  ['rule', 'paper', 'Hairline (decorative)', 0],
];

function swatches(tokens, mode) {
  return roles.map(([name, role]) => `
    <div class="swatch">
      <span class="chip" style="background:${tokens[name]}"></span>
      <div><b>--${name}</b><span class="mono">${tokens[name]}</span><p>${role}</p></div>
    </div>`).join('');
}

function contrastRows(tokens) {
  return pairs.map(([fg, bg, use, min]) => {
    const value = ratio(tokens[fg], tokens[bg]);
    const darkGroundsOnly = fg === 'leaf' && tokens === light;
    const verdict = min === 0 ? 'decorative' : darkGroundsOnly ? 'dark grounds only' : value >= min ? `passes ${min}:1` : `below ${min}:1`;
    return `<tr><td><span class="pair" style="background:${tokens[bg]};color:${tokens[fg]}">Aa</span></td>
      <td>--${fg} on --${bg}</td><td class="mono">${value.toFixed(2)}</td><td>${use}</td><td>${verdict}</td></tr>`;
  }).join('');
}

const reading = dark['color-text-reading'];
// The dark palette before the 14 Oct 2026 softening, kept for the before/after comparison.
const before = { paper: '#121110', ink: '#EEECE8', reading: '#D2CEC8' };
const specimenText = 'Your list will differ. That is the point. There is no single right answer for everyone. There is one right answer for each use case, and you find it by measuring your own work.';
const specimenList = '<b>Real tasks.</b> Use work from your own history, not generic puzzles.';

function readingPanel(label, paper, body, strong, note) {
  return `<div class="panel" style="background:${paper}">
    <p class="panel-label" style="color:${dark['ink-2']}">${label}</p>
    <h3 style="color:${strong}">What measuring takes</h3>
    <p style="color:${body}">${specimenText}</p>
    <p style="color:${body}">${specimenList.replace('<b>', `<b style="color:${strong}">`)}</p>
    <p class="panel-note mono" style="color:${dark['ink-2']}">${note}</p>
  </div>`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Colour and type</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Literata:ital,opsz,wght@0,7..72,400;1,7..72,400&display=swap" rel="stylesheet">
<style>
:root { --paper:${light.paper}; --raised:${light['paper-raised']}; --sage:${light.sage}; --ink:${light.ink}; --ink-2:${light['ink-2']}; --rule:${light.rule}; --leaf:${light.leaf}; --leaf-ink:${light['leaf-ink']}; }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 400 10.5pt/1.55 'Instrument Sans', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 18mm 18mm 14mm; page-break-after: always; position: relative; overflow: hidden; }
.page:last-child { page-break-after: auto; }
.page.dark { background: ${dark.paper}; color: ${dark.ink}; }
.page.dark .label, .page.dark .swatch p, .page.dark .foot { color: ${dark['ink-2']}; }
.page.dark .swatch, .page.dark table td, .page.dark table th { border-color: ${dark.rule}; }
.label { font-size: 9pt; font-weight: 500; color: var(--ink-2); margin: 0 0 6mm; }
.label span { color: var(--leaf-ink); }
.page.dark .label span { color: ${dark['leaf-ink']}; }
h1 { font-weight: 500; letter-spacing: -0.04em; font-size: 30pt; line-height: 1.02; margin: 0 0 4mm; }
h2 { font-weight: 500; letter-spacing: -0.035em; font-size: 20pt; line-height: 1.15; margin: 0 0 4mm; }
h1 em, h2 em { font-style: normal; color: var(--ink-2); }
.page.dark h2 em { color: ${dark['ink-2']}; }
h3 { font-size: 10.5pt; font-weight: 600; margin: 0 0 2mm; }
.lead { font-size: 11pt; color: var(--ink-2); max-width: 150mm; margin: 0 0 5mm; }
.mono { font-family: 'IBM Plex Mono', monospace; font-size: 8.5pt; }
.swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; }
.swatch { display: flex; gap: 4mm; align-items: flex-start; padding: 2mm 0; border-top: 1px solid var(--rule); }
.swatch b { font-weight: 500; margin-right: 2mm; }
.swatch p { margin: 0.5mm 0 0; color: var(--ink-2); font-size: 9pt; line-height: 1.4; }
.chip { flex: none; width: 10mm; height: 10mm; border-radius: 6px; border: 1px solid ${light['ink-2']}55; }
table { width: 100%; border-collapse: collapse; margin-top: 3mm; font-size: 9pt; }
th { text-align: left; font-weight: 500; color: inherit; opacity: .75; padding: 1.6mm 2mm 1.6mm 0; border-bottom: 1px solid var(--rule); }
td { padding: 1.3mm 2mm 1.3mm 0; border-bottom: 1px solid var(--rule); vertical-align: middle; }
.pair { display: inline-block; width: 11mm; text-align: center; border-radius: 4px; padding: 0.6mm 0; font-weight: 600; border: 1px solid #8884; }
.panels { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 6mm; }
.panel { border-radius: 12px; padding: 7mm 6mm; border: 1px solid ${dark.rule}; }
.panel h3 { font-size: 16pt; font-weight: 500; letter-spacing: -0.035em; margin: 0 0 4mm; }
.panel p { font-size: 10.5pt; line-height: 1.9; margin: 0 0 3mm; }
.panel .panel-label { font-size: 8.5pt; font-weight: 500; margin: 0 0 4mm; line-height: 1.4; }
.panel .panel-note { margin: 4mm 0 0; line-height: 1.5; }
.faces { display: grid; gap: 0; }
.face { display: grid; grid-template-columns: 52mm 1fr; gap: 6mm; padding: 5mm 0; border-top: 1px solid var(--rule); }
.face .sample { font-size: 30pt; line-height: 1.1; letter-spacing: -0.03em; }
.face p { margin: 1mm 0 0; color: var(--ink-2); font-size: 9pt; }
.scale td:first-child { width: 38mm; }
.foot { position: absolute; left: 18mm; right: 18mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 8pt; color: var(--ink-2); }
.notes { columns: 2; column-gap: 8mm; font-size: 9.5pt; padding-left: 4mm; margin: 0; }
.notes li { break-inside: avoid; margin-bottom: 2mm; }
</style></head><body>

<section class="page">
  <p class="label"><span>●</span> sgargeya.com · Design system v3</p>
  <h1>Colour and type. <em>McLaren papaya on warm graphite.</em></h1>
  <p class="lead">The site shares Edudojo’s design language: warm paper, one sans, hairlines, dot motion. The colours are its own, so the person and the company stay distinct. Every colour on these pages is read from <span class="mono">app/field.css</span>, and every ratio is measured.</p>
  <h2>Light mode</h2>
  <div class="swatches">${swatches(light)}</div>
  <table><thead><tr><th></th><th>Pair</th><th>Ratio</th><th>Use</th><th>WCAG</th></tr></thead><tbody>${contrastRows(light)}</tbody></table>
  <div class="foot"><span>Colour · light</span><span class="mono">1 / 4</span></div>
</section>

<section class="page dark">
  <p class="label"><span>●</span> Dark mode</p>
  <h2>Dark mode. <em>Same roles, warm graphite paper.</em></h2>
  <div class="swatches">${swatches(dark)}
    <div class="swatch"><span class="chip" style="background:${reading}"></span><div><b>--color-text-reading</b><span class="mono">${reading}</span><p>Paragraphs and lists in long text. ${ratio(reading, dark.paper).toFixed(1)}:1</p></div></div>
  </div>
  <table><thead><tr><th></th><th>Pair</th><th>Ratio</th><th>Use</th><th>WCAG</th></tr></thead><tbody>${contrastRows(dark)}</tbody></table>
  <div class="foot"><span>Colour · dark</span><span class="mono">2 / 4</span></div>
</section>

<section class="page dark">
  <p class="label"><span>●</span> Reading in dark mode</p>
  <h2>A softer dark theme. <em>About 10:1 to 14:1, not 16:1.</em></h2>
  <p class="lead" style="color:${dark['ink-2']}">Near-white text on near-black glows at the edges of each letter, and the eye tires. Every dark page now sits on slightly lifted paper with dimmer ink. Long text (essay and Notes paragraphs) drops one more step to reading ink. Headings and bold text keep the ink.</p>
  <div class="panels">
    ${readingPanel('Before', before.paper, before.reading, before.ink, `paper ${before.paper}<br>body ${before.reading} · ${ratio(before.reading, before.paper).toFixed(1)}:1<br>ink ${before.ink} · ${ratio(before.ink, before.paper).toFixed(1)}:1`)}
    ${readingPanel('Now', dark.paper, reading, dark.ink, `paper ${dark.paper}<br>body ${reading} · ${ratio(reading, dark.paper).toFixed(1)}:1<br>ink ${dark.ink} · ${ratio(dark.ink, dark.paper).toFixed(1)}:1`)}
  </div>
  <ul class="notes" style="margin-top:8mm">
    <li>Both stay far above WCAG AAA (7:1) for body text.</li>
    <li>Keep dark text between about 10:1 and 14:1. Do not go back to pure white.</li>
    <li>Light mode does not change. Dark ink on warm paper does not glow.</li>
    <li>Change the value in the token block only, never in a component.</li>
  </ul>
  <div class="foot"><span>Colour · reading</span><span class="mono">3 / 4</span></div>
</section>

<section class="page">
  <p class="label"><span>●</span> Typography</p>
  <h2>Three faces. <em>Each has one job.</em></h2>
  <div class="faces">
    <div class="face"><div><h3>Instrument Sans</h3><p>Headings, text and UI. Headings 500 with −0.035em to −0.04em tracking. Body 400; 500 to 600 for short labels only.</p></div>
      <div class="sample" style="font-weight:500">I build tools for how we learn to think.</div></div>
    <div class="face"><div><h3>Literata</h3><p>A person’s writing: article and Notes prose, essay titles, quotes.</p></div>
      <div class="sample" style="font-family:Literata,serif;font-size:20pt;letter-spacing:0;line-height:1.4">One idea on learning, AI, and being human. <i>Delivered Sunday evening.</i></div></div>
    <div class="face"><div><h3>IBM Plex Mono</h3><p>Real data only: dates, versions, steps, numerals. A unit next to a number stays in sans.</p></div>
      <div class="sample mono" style="font-size:20pt;letter-spacing:0">14 Oct 2026 · v3 · 51</div></div>
  </div>
  <h3 style="margin-top:6mm">Scale on the site</h3>
  <table class="scale"><thead><tr><th>Role</th><th>Size</th><th>Weight · tracking · leading</th><th>Where</th></tr></thead><tbody>
    <tr><td>Hero h1</td><td class="mono">up to 5.25rem</td><td>500 · −0.04em · 1.02</td><td>Homepage headline</td></tr>
    <tr><td>Section h2</td><td class="mono">clamp(2.1rem, 3.6vw, 3.4rem)</td><td>500 · −0.035em · 1.06</td><td>Section headings</td></tr>
    <tr><td>Article title</td><td class="mono">clamp(2rem, 4.4vw, 3.65rem)</td><td>550 · −0.048em · 1.13</td><td>Journal essays</td></tr>
    <tr><td>Essay h2</td><td class="mono">clamp(1.45rem, 2.4vw, 1.9rem)</td><td>550 · −0.035em · 1.4</td><td>Inside an essay</td></tr>
    <tr><td>Reading body</td><td class="mono">1.0625rem (1.25rem large)</td><td>400 · 0 · 1.9</td><td>Essay paragraphs</td></tr>
    <tr><td>Copy</td><td class="mono">16px</td><td>400 · 0 · 1.8</td><td>Intros, max 560px</td></tr>
    <tr><td>Label</td><td class="mono">13px</td><td>500 · 0 · 1.6</td><td>Field labels, kickers</td></tr>
  </tbody></table>
  <h3 style="margin-top:6mm">Rules</h3>
  <ul class="notes">
    <li>An <span class="mono">&lt;em&gt;</span> in an h1 or h2 is the second tone: upright, in <span class="mono">--ink-2</span>, never italic.</li>
    <li>Papaya is a signal: dots, the last step, focus. Orange text uses <span class="mono">--leaf-ink</span>.</li>
    <li>Separate with 1px hairlines and space, not boxes. One raised object per view.</li>
    <li>Do not bring back Instrument Serif or Manrope.</li>
  </ul>
  <div class="foot"><span>Type</span><span class="mono">4 / 4</span></div>
</section>
</body></html>`;

const outDir = resolve(root, 'docs/design');
mkdirSync(outDir, { recursive: true });
const htmlPath = resolve(outDir, 'colour-and-type.html');
writeFileSync(htmlPath, html);

const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
];
const browser = browsers.find((path) => existsSync(path));
if (!browser) {
  console.log(`Wrote ${htmlPath}. No Edge or Chrome found; print it to PDF by hand.`);
} else {
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=8000',
    `--print-to-pdf=${resolve(outDir, 'colour-and-type.pdf')}`, pathToFileURL(htmlPath).href], { stdio: 'inherit' });
  console.log(`Wrote ${htmlPath} and colour-and-type.pdf`);
}
