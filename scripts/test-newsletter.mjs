/**
 * Notes model + HTML checks.
 * Run: npm run test:newsletter
 */
import assert from 'node:assert/strict';
import {
  acknowledge,
  applyCuratorEdit,
  buildTaste,
  canRelease,
  emptyWeek,
  isLocalSunday7pm,
  letterIdForSunday,
  medianReadSeconds,
  mergeIngest,
  sanitizeWeek,
  setAutoPublish,
  shouldSendToTimezone,
  skipWeek,
  upcomingSunday,
} from '../lib/newsletter-model.ts';
import { emailHasUnsubscribe, markdownToEmailHtml } from '../lib/newsletter-markdown.ts';

const sunday = upcomingSunday(new Date('2026-08-31T08:00:00.000Z'));
assert.equal(sunday, '2026-09-06');
assert.equal(letterIdForSunday(sunday), 'letter-2026-09-06');

const istSundayEvening = new Date('2026-09-06T13:30:00.000Z');
assert.equal(isLocalSunday7pm('Asia/Kolkata', istSundayEvening), true);
assert.equal(isLocalSunday7pm('America/New_York', istSundayEvening), false);

const nySundayEvening = new Date('2026-09-06T23:00:00.000Z');
assert.equal(isLocalSunday7pm('America/New_York', nySundayEvening), true);

let week = emptyWeek('2026-09-06', new Date('2026-09-05T13:30:00.000Z'));
week = mergeIngest(null, {
  ...week,
  title: 'Keep the hard hour',
  subject: 'Keep the hard hour',
  bodyMd: 'Bot draft about learning with AI.',
  draftMd: 'Bot draft about learning with AI.',
  topics: [
    {
      id: 't1',
      title: 'Learning with the tool in the room',
      thesisFit: 'Mind stays in the loop',
      whyDistinct: 'Technique, not a model roundup',
      sources: [{ title: 'Paper', url: 'https://example.com/paper' }],
      status: 'picked',
    },
  ],
});
assert.equal(week.stage, 'draft');
assert.equal(week.autoPublish, false);
assert.equal(canRelease(week), false);

week = applyCuratorEdit(week, { bodyMd: 'Curator rewrite. The mind still has to do the hour.' });
assert.equal(week.bodyMd.includes('Curator rewrite'), true);

week = mergeIngest(week, {
  ...week,
  draftMd: 'Bot refresh with a new study.',
  bodyMd: 'Bot refresh with a new study.',
  autoPublish: true,
  title: 'Keep the hard hour',
});
assert.equal(week.bodyMd.includes('Curator rewrite'), true);
assert.equal(week.draftMd.includes('Bot refresh'), true);
assert.equal(week.autoPublish, false, 'bot cannot flip auto-publish');

week = setAutoPublish(week, true);
assert.equal(week.autoPublish, true);
assert.equal(canRelease(week), true);
assert.equal(
  shouldSendToTimezone(week, 'Asia/Kolkata', istSundayEvening),
  true
);

const happy = acknowledge(
  { ...week, autoPublish: false, acknowledgedAt: null },
  new Date('2026-09-07T10:00:00.000Z')
);
assert.equal(happy.stage, 'approved');
assert.equal(canRelease(happy), true);
assert.equal(
  shouldSendToTimezone(happy, 'America/Los_Angeles', new Date('2026-09-07T10:00:00.000Z')),
  true,
  'ack without auto-publish sends immediately'
);

const skipped = skipWeek(week, 'Not ready');
assert.equal(skipped.stage, 'skipped');
assert.equal(canRelease(skipped), false);

const dirty = sanitizeWeek({
  weekOf: '2026-09-06',
  title: 'x',
  bodyMd: 'hi',
  links: [{ label: 'Essay', url: 'https://sgargeya.com/blog/hello', kind: 'blog' }],
  topics: [{ title: 'Nope', status: 'nope' }],
});
assert.equal(dirty.topics[0].status, 'proposed');
assert.equal(dirty.links[0].kind, 'blog');

const html = markdownToEmailHtml('Hello **world** and [a paper](https://example.com/p).');
assert.match(html, /<strong[^>]*>world<\/strong>/);
assert.match(html, /href="https:\/\/example.com\/p"/);

const structured = markdownToEmailHtml(
  'Lead sentence lives here.\n\n> A pull quote for the screenshot.\n\n## Keep the hour\n\n1. **First pass** without the model.\n2. Then open the tool.\n'
);
assert.match(structured, /font-size:19px/);
assert.match(structured, /pull quote/);
assert.match(structured, /Keep the hour/);
assert.match(structured, /01/);
assert.equal(
  emailHasUnsubscribe('<a href="{{{RESEND_UNSUBSCRIBE_URL}}}">unsubscribe</a>'),
  true
);
assert.equal(emailHasUnsubscribe('<p>nope</p>'), false);

assert.equal(medianReadSeconds([5, 12, 40, 80, 90]), 80);
assert.equal(medianReadSeconds([5, 12]), null);

const taste = buildTaste([
  {
    ...week,
    topics: [
      {
        id: 't2',
        title: 'Generic AI news',
        thesisFit: '',
        whyDistinct: '',
        sources: [],
        status: 'rejected',
        curatorNote: 'Roundup. Skip.',
      },
    ],
    draftMd: 'Bot said this.',
    bodyMd: 'He said that instead.',
    events: [{ at: '2026-09-06T00:00:00.000Z', kind: 'note', note: 'Warmer. Less slogan.' }],
  },
]);
assert.equal(taste.rejectedTopics[0].title, 'Generic AI news');
assert.equal(taste.editPairs[0].bodyMd.includes('He said that'), true);
assert.equal(taste.notes.includes('Warmer. Less slogan.'), true);

console.log('newsletter tests ok');
