import assert from 'node:assert/strict';
import { humanizeNotionError } from '../lib/ledger-notion-errors.ts';

const upstreamError = Object.assign(new Error('Cross-cell memcached access is not allowed'), {
  status: 500,
  code: 'internal_server_error',
  request_id: 'notion-request-123',
  body: 'private request data',
});
const message = humanizeNotionError(upstreamError);
assert.match(message, /Notion returned an internal server error/);
assert.match(message, /check the Notion database before retrying/);
assert.match(message, /Request ID: notion-request-123/);
assert.ok(!message.includes('private request data'));
assert.ok(!humanizeNotionError(new Error(upstreamError.message)).includes('Request ID:'));
assert.match(humanizeNotionError(new Error('API token is invalid')), /rejected the integration token/);
assert.match(humanizeNotionError(new Error('Could not find database with ID')), /Connections/);
assert.match(humanizeNotionError(new Error('multiple data sources')), /original database/);
assert.equal(humanizeNotionError(new Error('Amount must be a number')), 'Amount must be a number');
console.log('PASS: Notion upstream failure attribution, request ID, and existing error messages.');
