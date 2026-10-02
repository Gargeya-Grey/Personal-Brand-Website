import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
// Permit repository TypeScript's bundler-style paths in the Node-only regression runner.
export async function resolve(specifier, context, next) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export{}', shortCircuit: true };
  if (specifier === 'next/server' || specifier === 'next/headers') return next(`${specifier}.js`, context);
  if (specifier.startsWith('@/')) {
    const url = new URL(specifier.slice(2) + '.ts', root);
    return { url: url.href, shortCircuit: true };
  }
  if (specifier.startsWith('.') && !/\.(ts|mjs|js|json)$/.test(specifier)) {
    const url = new URL(specifier + '.ts', context.parentURL);
    if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
  }
  return next(specifier, context);
}
