import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allWork } from '../data/selected-work.ts';
import { coverSceneNames } from '../lib/project-cover.ts';

const ids = new Set();
for (const work of allWork) {
  assert(!ids.has(work.id), `Duplicate project id: ${work.id}`);
  ids.add(work.id);
  const cover = work.cover;
  assert(cover, `${work.id}: intentional cover metadata is required`);
  if (cover.kind === 'svg') {
    assert(coverSceneNames.includes(cover.scene), `${work.id}: unknown SVG scene`);
    assert(['sea', 'mist', 'lilac'].includes(cover.palette), `${work.id}: use a shared palette`);
    for (const field of ['label', 'detail']) {
      assert(
        typeof cover[field] === 'string' &&
          cover[field].trim().length > 0 &&
          cover[field].length <= 32,
        `${work.id}: ${field} must be 1–32 characters`,
      );
    }
  } else {
    assert.equal(cover.kind, 'image', `${work.id}: unsupported cover type`);
    assert.equal(cover.approvedBy, 'owner', `${work.id}: image exception needs owner approval`);
    assert(cover.reason?.trim(), `${work.id}: record the approval reason`);
    assert(
      /^\/(?!\/)/.test(cover.src) && !cover.src.split('/').includes('..'),
      `${work.id}: approved cover must be a local public asset`,
    );
    assert(
      existsSync(fileURLToPath(new URL(`../public${cover.src}`, import.meta.url))),
      `${work.id}: cover asset is missing`,
    );
    assert(cover.position?.trim(), `${work.id}: specify the image focal point`);
  }
}
console.log(
  `PASS: ${ids.size} projects have deliberate covers, shared palettes, short captions, and valid approved assets.`,
);
