'use client';

import { useMemo } from 'react';
import { renderMarkdown } from '@/lib/markdown';

/** Public letter body. No editor debounce. */
export function NotesBody({ content }: { content: string }) {
  const nodes = useMemo(() => renderMarkdown(content), [content]);
  return <>{nodes}</>;
}
