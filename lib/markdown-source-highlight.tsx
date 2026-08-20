import React, { type ReactNode } from 'react';

const mark = 'text-[var(--atelier-faint)] opacity-60 font-normal not-italic';

function Mark({ children }: { children: ReactNode }) {
  return <span className={mark}>{children}</span>;
}

/**
 * Inline highlight that keeps every source character (asterisks, backticks, etc.).
 * Weights/colors only — same font-size/family as the textarea so the overlay stays aligned.
 */
function highlightInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = text;
  let n = 0;

  while (rest.length > 0) {
    const img = /!\[(.*?)\]\((.*?)\)/.exec(rest);
    const link = /\[(.*?)\]\((.*?)\)/.exec(rest);
    const bold = /\*\*(.+?)\*\*/.exec(rest);
    const italicStar = /(?:^|[^*])(\*(?!\*)([^*]+)\*(?!\*))/.exec(rest);
    const italicUnder = /_(.+?)_/.exec(rest);
    const code = /`([^`]+)`/.exec(rest);

    type Hit = { index: number; length: number; node: ReactNode };
    let first: Hit | null = null;

    const take = (match: RegExpExecArray | null, index: number, length: number, node: ReactNode) => {
      if (!match) return;
      if (!first || index < first.index) {
        first = { index, length, node };
      }
    };

    if (img) {
      take(
        img,
        img.index,
        img[0].length,
        <span key={`${keyPrefix}-img-${n}`} className="text-[var(--atelier-gold)]">
          <Mark>![</Mark>
          {img[1]}
          <Mark>](</Mark>
          <span className="opacity-70">{img[2]}</span>
          <Mark>)</Mark>
        </span>
      );
    }
    if (link) {
      take(
        link,
        link.index,
        link[0].length,
        <span
          key={`${keyPrefix}-a-${n}`}
          className="text-[var(--atelier-gold)] underline underline-offset-2 decoration-[var(--atelier-gold)]/40"
        >
          <Mark>[</Mark>
          {link[1]}
          <Mark>](</Mark>
          <span className="opacity-70 no-underline">{link[2]}</span>
          <Mark>)</Mark>
        </span>
      );
    }
    if (bold) {
      take(
        bold,
        bold.index,
        bold[0].length,
        <span key={`${keyPrefix}-b-${n}`} className="font-bold text-[var(--atelier-ink)]">
          <Mark>**</Mark>
          {highlightInline(bold[1], `${keyPrefix}-bi-${n}`)}
          <Mark>**</Mark>
        </span>
      );
    }
    if (italicStar) {
      const full = italicStar[1];
      const inner = italicStar[2];
      const index = italicStar.index + italicStar[0].length - full.length;
      take(
        italicStar,
        index,
        full.length,
        <span key={`${keyPrefix}-i-${n}`} className="italic text-[var(--atelier-ink)]">
          <Mark>*</Mark>
          {highlightInline(inner, `${keyPrefix}-ii-${n}`)}
          <Mark>*</Mark>
        </span>
      );
    }
    if (italicUnder) {
      take(
        italicUnder,
        italicUnder.index,
        italicUnder[0].length,
        <span key={`${keyPrefix}-u-${n}`} className="italic text-[var(--atelier-ink)]">
          <Mark>_</Mark>
          {highlightInline(italicUnder[1], `${keyPrefix}-ui-${n}`)}
          <Mark>_</Mark>
        </span>
      );
    }
    if (code) {
      take(
        code,
        code.index,
        code[0].length,
        <span
          key={`${keyPrefix}-c-${n}`}
          className="rounded-sm bg-[var(--atelier-gold-soft)] text-emerald-700 dark:text-emerald-400"
        >
          <Mark>`</Mark>
          {code[1]}
          <Mark>`</Mark>
        </span>
      );
    }

    if (!first) {
      parts.push(rest);
      break;
    }

    const hit: Hit = first;
    if (hit.index > 0) {
      parts.push(rest.slice(0, hit.index));
    }
    parts.push(hit.node);
    rest = rest.slice(hit.index + hit.length);
    n += 1;
  }

  return parts;
}

const headingWeight = ['font-bold', 'font-bold', 'font-semibold', 'font-semibold', 'font-medium', 'font-medium'];

/**
 * Source-faithful markdown highlight for the write overlay.
 * Never drops characters; never changes font-size or family.
 */
export function highlightMarkdownSource(source: string): ReactNode {
  if (!source) return null;

  const lines = source.split('\n');
  const out: ReactNode[] = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) out.push('\n');
    const line = lines[i];
    const key = `l${i}`;

    if (line.trimStart().startsWith('```')) {
      inCode = !inCode;
      out.push(
        <span key={key} className="text-emerald-600 dark:text-emerald-400">
          {line}
        </span>
      );
      continue;
    }

    if (inCode) {
      out.push(
        <span key={key} className="text-emerald-700 dark:text-emerald-300">
          {line}
        </span>
      );
      continue;
    }

    const heading = /^(#{1,6})(\s+)(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(
        <span key={key} className={`${headingWeight[level - 1]} text-[var(--atelier-ink)]`}>
          <Mark>
            {heading[1]}
            {heading[2]}
          </Mark>
          {highlightInline(heading[3], key)}
        </span>
      );
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim()) && !line.includes('|')) {
      out.push(
        <span key={key} className="text-[var(--atelier-faint)]">
          {line}
        </span>
      );
      continue;
    }

    if (line.startsWith('>')) {
      const rest = line.startsWith('> ') ? line.slice(2) : line.slice(1);
      const pad = line.startsWith('> ') ? '> ' : '>';
      out.push(
        <span key={key} className="italic text-[var(--atelier-ink)]">
          <Mark>{pad}</Mark>
          {highlightInline(rest, key)}
        </span>
      );
      continue;
    }

    const ul = /^(\s*)([-*+])(\s+)(.*)$/.exec(line);
    if (ul) {
      out.push(
        <span key={key}>
          {ul[1]}
          <span className="text-[var(--atelier-gold)]">{ul[2]}</span>
          {ul[3]}
          {highlightInline(ul[4], key)}
        </span>
      );
      continue;
    }

    const ol = /^(\s*)(\d+\.)(\s+)(.*)$/.exec(line);
    if (ol) {
      out.push(
        <span key={key}>
          {ol[1]}
          <span className="text-[var(--atelier-gold)]">{ol[2]}</span>
          {ol[3]}
          {highlightInline(ol[4], key)}
        </span>
      );
      continue;
    }

    if (line.includes('|')) {
      const cells: ReactNode[] = [];
      let buf = '';
      let ci = 0;
      const flush = (pipe: boolean) => {
        if (buf) {
          cells.push(
            <span key={`${key}-c${ci++}`}>{highlightInline(buf, `${key}-${ci}`)}</span>
          );
          buf = '';
        }
        if (pipe) {
          cells.push(
            <Mark key={`${key}-p${ci++}`}>|</Mark>
          );
        }
      };
      for (const ch of line) {
        if (ch === '|') flush(true);
        else buf += ch;
      }
      flush(false);
      out.push(<span key={key}>{cells}</span>);
      continue;
    }

    out.push(<span key={key}>{highlightInline(line, key)}</span>);
  }

  return out;
}
