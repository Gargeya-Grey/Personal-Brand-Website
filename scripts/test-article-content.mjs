import assert from 'node:assert/strict';
import { articleWordCount, extractArticleHeadings, parseInteractiveInfo, readFencedBlock } from '../lib/article-markdown.ts';
import { buildInteractiveDocument } from '../lib/article-interactive-document.ts';
import { INTERACTIVE_EXAMPLE } from '../lib/article-interactive-example.ts';
import {
  faceKey, normalizeFontWeight, normalizeUnicodeRange, parseUnicodeRanges, pickArticleFontFaces, primaryFamily,
} from '../lib/article-interactive-fonts.ts';

const markdown = [
  '## An idea',
  '```html',
  '## Not a section',
  '```',
  '## An idea',
  '### An idea-2',
  '~~~interactive title="Example"',
  '## Also not a section',
  '~~~',
  '## 新しい考え',
].join('\n');
assert.deepEqual(extractArticleHeadings(markdown).map(({ id }) => id), ['an-idea', 'an-idea-2', 'an-idea-2-2', 'section']);
assert.equal(parseInteractiveInfo('html'), null, 'Ordinary HTML examples must not execute');
assert.equal(parseInteractiveInfo('interactive-malformed'), null);
assert.deepEqual(parseInteractiveInfo('interactive title="Try this" height=999999 description="Move the slider"'), {
  title: 'Try this', height: 1200, description: 'Move the slider',
});
assert.equal(parseInteractiveInfo('interactive').height, 360);
assert.equal(readFencedBlock(['````js', '```', '## inside code', '````'], 0).content, '```\n## inside code');
const unfinished = readFencedBlock(['```interactive', '<script>never run unfinished content</script>'], 0);
assert.equal(unfinished.closed, false);
assert.equal(unfinished.nextIndex, 2);
assert.equal(extractArticleHeadings('```js\n## still code').length, 0);
const example = readFencedBlock(INTERACTIVE_EXAMPLE.split('\n'), 0);
assert.equal(example.closed, true);
assert.equal(parseInteractiveInfo(example.info).title, 'Small changes compound');
assert.equal(articleWordCount('Before.\n```interactive title="A model"\n' + 'hidden code '.repeat(500) + '\n```\nAfter.'), 4);
const document = buildInteractiveDocument(example.content, '</title><script>bad()</script>', 'example');
assert.ok(document.indexOf('Content-Security-Policy') < document.indexOf('<script>'));
assert.ok(document.includes("connect-src 'none'"));
assert.ok(document.includes("frame-src 'none'"));
assert.ok(document.includes('&lt;/title&gt;&lt;script&gt;bad()&lt;/script&gt;'));
assert.ok(!document.includes('<title></title><script>'));
assert.ok(document.includes("font-src 'none'"), 'The font policy must stay closed');
assert.ok(document.includes('--font-body:"Instrument Sans"'));
assert.ok(document.includes('font:16px/1.6 var(--font-body)'));
assert.ok(document.includes('article-interactive:fonts'));
assert.ok(document.includes('new FontFace('));
assert.ok(document.includes("type:'article-interactive:ready'"));
assert.equal(primaryFamily('"Instrument Sans", sans-serif'), 'Instrument Sans');
assert.equal(primaryFamily("'IBM Plex Mono', monospace"), 'IBM Plex Mono');
assert.equal(primaryFamily(''), '');
const sheetHref = 'https://sgargeya.com/_next/static/css/app.css';
const faceRule = (family, src, unicodeRange, weight = '400 700') => ({ family, src, sheetHref, weight, style: 'normal', unicodeRange, stretch: '' });
assert.deepEqual(pickArticleFontFaces({
  families: ['Instrument Sans', 'Literata', 'IBM Plex Mono'],
  origin: 'https://sgargeya.com',
  rules: [
    faceRule('"Instrument Sans"', 'url("../media/latin.woff2") format("woff2")', 'U+0-FF, U+131'),
    faceRule('"Instrument Sans"', 'url("../media/latin-ext.woff2") format("woff2")', 'U+100-2BA'),
    faceRule('"Instrument Sans Fallback"', 'local("Arial")', ''),
    faceRule('Literata', 'url(https://fonts.example.com/literata.woff2)', 'U+0-FF'),
    faceRule('Other Font', 'url("../media/other.woff2")', 'U+0-FF'),
  ],
  loaded: [
    { family: '"Instrument Sans"', weight: '400 700', style: 'normal', unicodeRange: 'U+0-FF,U+131' },
    { family: 'Literata', weight: '400 700', style: 'normal', unicodeRange: 'U+0-FF' },
  ],
}), [{
  family: 'Instrument Sans',
  url: 'https://sgargeya.com/_next/static/media/latin.woff2',
  descriptors: { weight: '400 700', style: 'normal', unicodeRange: 'U+0-FF, U+131' },
}]);
assert.ok(document.includes("new CustomEvent('article-fonts'"), 'Block code gets an article-fonts event');
assert.ok(document.includes('if (fontsReceived) return;'), 'The frame ignores a second fonts message');
assert.ok(document.includes("body:'--font-body'") && document.includes('setFamilies('), 'The frame sets font variables from the page');
assert.ok(document.includes('event.source !== parent || event.data?.id !== id'), 'The frame still checks source and id');

// unicode-range: the CSSOM text and FontFace.unicodeRange may differ in spelling, never in meaning.
assert.deepEqual(parseUnicodeRanges('U+??'), [[0, 0xff]]);
assert.deepEqual(parseUnicodeRanges('U+4??'), [[0x400, 0x4ff]]);
assert.deepEqual(parseUnicodeRanges('U+0-FF'), [[0, 0xff]]);
assert.deepEqual(parseUnicodeRanges('U+0000-00FF'), [[0, 0xff]]);
assert.deepEqual(parseUnicodeRanges('u+0-ff'), [[0, 0xff]]);
assert.deepEqual(parseUnicodeRanges('U+26'), [[0x26, 0x26]]);
assert.deepEqual(parseUnicodeRanges('U+0-FF, U+131, U+152-153'), [[0, 0xff], [0x131, 0x131], [0x152, 0x153]]);
assert.deepEqual(parseUnicodeRanges('U+152-153,U+131,U+0-FF'), [[0, 0xff], [0x131, 0x131], [0x152, 0x153]], 'Order does not matter');
assert.deepEqual(parseUnicodeRanges('U+0-7F, U+80-FF'), [[0, 0xff]], 'Touching ranges merge');
assert.deepEqual(parseUnicodeRanges('U+0-FF, U+20-30'), [[0, 0xff]], 'Overlapping ranges merge');
assert.deepEqual(parseUnicodeRanges(''), [[0, 0x10ffff]], 'An empty list means every code point');
assert.deepEqual(parseUnicodeRanges('U+0-10FFFF'), [[0, 0x10ffff]]);
const chromiumLatinRange = 'U+0-FF, U+131, U+152-153, U+2BB-2BC, U+2C6, U+2DA, U+2DC, U+304, U+308, U+329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const chromiumRanges = parseUnicodeRanges(chromiumLatinRange);
assert.ok(chromiumRanges, 'A real next/font latin range parses');
assert.deepEqual(chromiumRanges[0], [0, 0xff]);
assert.deepEqual(chromiumRanges.at(-1), [0xfffd, 0xfffd]);
assert.equal(normalizeUnicodeRange(chromiumLatinRange), normalizeUnicodeRange(chromiumLatinRange.replace(/, /g, ',').toLowerCase()));
assert.equal(parseUnicodeRanges('not a range'), null);
assert.equal(parseUnicodeRanges('U+FF-0'), null);
assert.equal(parseUnicodeRanges('U+4?5'), null);
assert.equal(normalizeUnicodeRange('U+??'), normalizeUnicodeRange('U+0000-00FF'));
assert.equal(normalizeUnicodeRange('U+??'), normalizeUnicodeRange('u+0-ff'));
assert.equal(normalizeUnicodeRange(''), normalizeUnicodeRange('U+0-10FFFF'));
assert.notEqual(normalizeUnicodeRange('U+0-FF'), normalizeUnicodeRange('U+100-2BA'));
assert.equal(normalizeUnicodeRange('garbage  X'), normalizeUnicodeRange('GARBAGE X'), 'Unparsed text still compares without spaces and case');

// font-weight: ranges, single values and keywords.
assert.equal(normalizeFontWeight('100 900'), normalizeFontWeight('100  900'));
assert.equal(normalizeFontWeight('100 900'), '100-900');
assert.equal(normalizeFontWeight('400'), normalizeFontWeight('normal'));
assert.equal(normalizeFontWeight('400'), normalizeFontWeight('400 400'));
assert.equal(normalizeFontWeight('bold'), normalizeFontWeight('700'));
assert.equal(normalizeFontWeight('900 100'), normalizeFontWeight('100 900'));
assert.equal(normalizeFontWeight(''), normalizeFontWeight('normal'));
assert.notEqual(normalizeFontWeight('400 700'), normalizeFontWeight('400'));
assert.equal(
  faceKey({ family: '"Literata"', weight: '200 900', style: 'italic', unicodeRange: 'U+??' }),
  faceKey({ family: 'literata', weight: '200  900', style: 'Italic', unicodeRange: 'U+0000-00FF' }),
);
assert.notEqual(
  faceKey({ family: 'Literata', weight: '200 900', style: 'italic', unicodeRange: 'U+??' }),
  faceKey({ family: 'Literata', weight: '200 900', style: 'normal', unicodeRange: 'U+??' }),
);

// Faces match when the two APIs spell the same range differently.
const spelledDifferently = pickArticleFontFaces({
  families: ['Literata'],
  origin: 'https://sgargeya.com',
  rules: [
    faceRule('Literata', 'url("../media/latin.woff2")', 'U+??', '200 900'),
    faceRule('Literata', 'url("../media/ext.woff2")', 'U+100-2BA', '200 900'),
  ],
  loaded: [{ family: '"Literata"', weight: '200  900', style: 'normal', unicodeRange: 'u+0000-00ff' }],
});
assert.deepEqual(spelledDifferently.map((face) => face.url), ['https://sgargeya.com/_next/static/media/latin.woff2']);
assert.deepEqual(pickArticleFontFaces({
  families: ['Literata'], origin: 'https://sgargeya.com',
  rules: [faceRule('Literata', 'url("../media/a.woff2")', 'U+??')], loaded: [],
}), [], 'No loaded faces, no fonts');
assert.deepEqual(pickArticleFontFaces({
  families: [], origin: 'https://sgargeya.com',
  rules: [faceRule('Literata', 'url("../media/a.woff2")', 'U+??')],
  loaded: [{ family: 'Literata', weight: '400 700', style: 'normal', unicodeRange: 'U+0-FF' }],
}), [], 'No wanted families, no fonts');
console.log('Article content checks passed: anchors, fenced blocks, opt-in interactive syntax, document isolation policy, article fonts.');
