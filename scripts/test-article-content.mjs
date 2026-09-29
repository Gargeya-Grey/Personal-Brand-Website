import assert from 'node:assert/strict';
import { articleWordCount, extractArticleHeadings, parseInteractiveInfo, readFencedBlock } from '../lib/article-markdown.ts';
import { buildInteractiveDocument } from '../lib/article-interactive-document.ts';
import { INTERACTIVE_EXAMPLE } from '../lib/article-interactive-example.ts';

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
console.log('Article content checks passed: anchors, fenced blocks, opt-in interactive syntax, document isolation policy.');
