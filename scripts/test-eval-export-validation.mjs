import assert from 'node:assert/strict';
import {
  InvalidEvalExport,
  exactExportObject,
  exportChoice,
  exportIdentifier,
  exportNumber,
  nullableExportValue,
  exportArray,
  parseVersionedEvalExport,
} from '../lib/eval-export-validation.ts';

// A synthetic schema exercises validation mechanics; it is not the publication contract or data.
const record = exactExportObject({
  identifier: exportIdentifier(/^public-[a-z0-9]+$/, 32),
  label: exportChoice(['Reviewed label']),
  count: exportNumber({ integer: true }),
  duration: nullableExportValue(exportNumber()),
});
const schema = exactExportObject({
  report_version: exportChoice([7]),
  records: exportArray(record, 4),
});
const input = {
  report_version: 7,
  records: [{ identifier: 'public-example', label: 'Reviewed label', count: 2, duration: null }],
};
const parse = (value) => parseVersionedEvalExport(value, { 7: schema });
assert.deepEqual(parse(input), input);
assert.notEqual(parse(input), input);
assert.notEqual(parse(input).records[0], input.records[0]);
assert.equal(parse(input).records[0].duration, null);
const rejected = (value) => assert.throws(() => parse(value), InvalidEvalExport);
rejected({ ...input, unapprovedRoot: 'DO_NOT_RENDER' });
rejected({ ...input, report_version: 8 });
rejected({ ...input, report_version: '7' });
rejected({ records: input.records });
rejected({ ...input, records: [{ ...input.records[0], privateField: 'DO_NOT_RENDER' }] });
rejected({ ...input, records: [{ ...input.records[0], label: 'Unreviewed free text' }] });
rejected({ ...input, records: [{ ...input.records[0], identifier: 'not-approved/example' }] });
rejected({ ...input, records: [{ ...input.records[0], identifier: 'public-example\n' }] });
for (const count of [-1, 1.5, NaN, Infinity, '2', null, undefined, Number.MAX_SAFE_INTEGER + 1]) {
  rejected({ ...input, records: [{ ...input.records[0], count }] });
}
for (const duration of [-1, NaN, Infinity, '0', undefined]) {
  rejected({ ...input, records: [{ ...input.records[0], duration }] });
}
rejected({ ...input, records: [undefined] });
rejected({ ...input, records: new Array(1) });
rejected({ ...input, records: Array(5).fill(input.records[0]) });
const augmented = [...input.records];
augmented.unapproved = 'DO_NOT_RENDER';
rejected({ ...input, records: augmented });
const arrayAccessor = [...input.records];
Object.defineProperty(arrayAccessor, '0', {
  get() {
    throw new Error('Must not execute');
  },
});
rejected({ ...input, records: arrayAccessor });
rejected({ ...input, records: [{ ...input.records[0], [Symbol('unapproved')]: 'DO_NOT_RENDER' }] });
const inherited = Object.create(input);
rejected(inherited);
let getterCalls = 0;
const accessor = { records: input.records };
Object.defineProperty(accessor, 'report_version', {
  enumerable: true,
  get() {
    getterCalls++;
    return 7;
  },
});
rejected(accessor);
assert.equal(getterCalls, 0);
try {
  parse({ ...input, 'private-sensitive-value': 'DO_NOT_RENDER' });
} catch (error) {
  assert(!error.message.includes('private-sensitive-value'));
  assert(!error.message.includes('DO_NOT_RENDER'));
}
console.log(
  'PASS: exact nested fields, approved versions/labels, finite typed metrics, null preservation, projection, accessor rejection, and non-disclosing errors',
);
