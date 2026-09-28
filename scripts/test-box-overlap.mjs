import assert from 'node:assert/strict';
import { boxOverlap } from '../lib/box-overlap.ts';

const reference = { x: 0, y: 0, width: 10, height: 10 };
assert.equal(boxOverlap(reference, reference).iou, 1);
assert.equal(boxOverlap(reference, { ...reference, x: 10 }).iou, 0);
assert.equal(boxOverlap(reference, { ...reference, x: 20, y: 20 }).iou, 0);
assert.equal(boxOverlap(reference, { ...reference, x: 5 }).iou, 1 / 3);
assert.equal(boxOverlap(reference, { x: 2, y: 2, width: 5, height: 5 }).iou, 0.25);
assert.equal(boxOverlap({ ...reference, width: 0 }, { ...reference, width: 0 }).iou, 0);
const prediction = { x: -3, y: 4, width: 8, height: 9 };
assert.deepEqual(boxOverlap(reference, prediction), boxOverlap(prediction, reference));
console.log(
  'Overlap geometry: identical, touching, disjoint, partial, contained, empty, and symmetric cases pass.',
);
