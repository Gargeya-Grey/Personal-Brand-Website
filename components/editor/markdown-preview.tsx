'use client';

import { useMemo } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function MarkdownPreview({ content }: { content: string }) {
  const debounced = useDebouncedValue(content, 260);
  const nodes = useMemo(() => renderMarkdown(debounced), [debounced]);
  return <>{nodes}</>;
}
