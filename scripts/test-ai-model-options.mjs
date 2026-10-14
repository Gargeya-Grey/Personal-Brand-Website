/**
 * Model slug and effort checks for the atelier's AI controls.
 * Run: npm run test:ai
 */
import assert from 'node:assert/strict';
import {
  MAX_MODEL_SLUG_LENGTH,
  REASONING_EFFORTS,
  aiChoiceStorageKey,
  aiModelRequest,
  normalizeEffort,
  normalizeModelSlug,
  openRouterReasoning,
} from '../lib/ai-model-options.ts';

// Real slugs pass, trimmed.
assert.equal(normalizeModelSlug('anthropic/claude-sonnet-4.5'), 'anthropic/claude-sonnet-4.5');
assert.equal(normalizeModelSlug('  nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free '), 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free');
assert.equal(normalizeModelSlug('gemini-flash-latest'), 'gemini-flash-latest');
assert.equal(normalizeModelSlug('openrouter/auto'), 'openrouter/auto');
assert.equal(normalizeModelSlug('~anthropic/claude-sonnet-latest'), '~anthropic/claude-sonnet-latest');

// Empty, non-string, malformed or oversized slugs fall back to the .env model (null).
assert.equal(normalizeModelSlug(''), null);
assert.equal(normalizeModelSlug('   '), null);
assert.equal(normalizeModelSlug(undefined), null);
assert.equal(normalizeModelSlug(42), null);
assert.equal(normalizeModelSlug({ model: 'x' }), null);
assert.equal(normalizeModelSlug('vendor/model name'), null);
assert.equal(normalizeModelSlug('../../etc/passwd'), null);
assert.equal(normalizeModelSlug('model?key=1'), null);
assert.equal(normalizeModelSlug('/leading-slash'), null);
assert.equal(normalizeModelSlug('a'.repeat(MAX_MODEL_SLUG_LENGTH)), 'a'.repeat(MAX_MODEL_SLUG_LENGTH));
assert.equal(normalizeModelSlug('a'.repeat(MAX_MODEL_SLUG_LENGTH + 1)), null);

// Effort: every listed level passes; anything else is "default".
for (const effort of REASONING_EFFORTS) assert.equal(normalizeEffort(effort), effort);
assert.equal(normalizeEffort(' HIGH '), 'high');
assert.equal(normalizeEffort('extreme'), 'default');
assert.equal(normalizeEffort(undefined), 'default');
assert.equal(normalizeEffort(3), 'default');

// Requests leave out what the server should default.
assert.deepEqual(aiModelRequest('', 'default'), {});
assert.deepEqual(aiModelRequest('bad slug', 'default'), {});
assert.deepEqual(aiModelRequest(' x-ai/grok-4 ', 'high'), { model: 'x-ai/grok-4', effort: 'high' });
assert.deepEqual(aiModelRequest('', 'none'), { effort: 'none' });

// OpenRouter gets a reasoning field only when the owner picks a level; the reasoning text stays out of the answer.
assert.equal(openRouterReasoning('default'), undefined);
assert.deepEqual(openRouterReasoning('none'), { effort: 'none', exclude: true });
assert.deepEqual(openRouterReasoning('xhigh'), { effort: 'xhigh', exclude: true });

// Each surface and provider has its own storage key.
assert.equal(aiChoiceStorageKey('blog-metadata'), 'atelier:ai-model:blog-metadata:openrouter');
assert.notEqual(aiChoiceStorageKey('ledger-extract', 'google'), aiChoiceStorageKey('ledger-extract', 'openrouter'));

console.log('ai model option checks passed');
