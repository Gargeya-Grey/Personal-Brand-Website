/** Shared by the renderer and contents navigation so anchors always agree. */
export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

export function readFencedBlock(lines: string[], start: number) {
  const opening = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(lines[start]);
  if (!opening) return null;
  const fence = opening[1];
  const closing = new RegExp(`^\\s{0,3}${fence[0]}{${fence.length},}\\s*$`);
  let end = start + 1;
  while (end < lines.length && !closing.test(lines[end])) end++;
  return {
    info: opening[2].trim(),
    content: lines.slice(start + 1, end).join('\n'),
    closed: end < lines.length,
    nextIndex: Math.min(end + 1, lines.length),
  };
}

export function extractArticleHeadings(markdown: string | undefined | null) {
  const lines = (markdown ?? '').split(/\r?\n/);
  const usedIds = new Set<string>();
  const headings: { id: string; text: string; level: number; line: number }[] = [];
  for (let line = 0; line < lines.length; line++) {
    const block = readFencedBlock(lines, line);
    if (block) {
      line = block.nextIndex - 1;
      continue;
    }
    const match = /^(#{2,3})\s+(.+)$/.exec(lines[line]);
    if (!match) continue;
    const raw = match[2].trim();
    const base = slugify(raw) || 'section';
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    headings.push({
      id,
      text: raw.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, ''),
      level: match[1].length,
      line,
    });
  }
  return headings;
}

export function parseInteractiveInfo(info: string) {
  if (!/^interactive(?:\s|$)/.test(info)) return null;
  const title = /\btitle="([^"]*)"/.exec(info)?.[1]?.trim() || 'Explore this idea';
  const description = /\bdescription="([^"]*)"/.exec(info)?.[1]?.trim() || '';
  const requestedHeight = Number(/\bheight=(?:"(\d+)"|(\d+))/.exec(info)?.slice(1).find(Boolean));
  const height = Number.isFinite(requestedHeight) && requestedHeight > 0
    ? Math.max(160, Math.min(1200, requestedHeight)) : 360;
  return { title, description, height };
}

/** Count the explanation of an interactive, not the hidden implementation. */
export function articleWordCount(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const readable: string[] = [];
  for (let line = 0; line < lines.length; line++) {
    const block = readFencedBlock(lines, line);
    if (block) {
      const interactive = block.closed ? parseInteractiveInfo(block.info) : null;
      readable.push(interactive ? `${interactive.title} ${interactive.description}` : block.content);
      line = block.nextIndex - 1;
    } else {
      readable.push(lines[line]);
    }
  }
  return readable.join(' ').trim().split(/\s+/).filter(Boolean).length;
}
