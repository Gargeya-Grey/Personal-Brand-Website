'use client';

import React from 'react';
import { ExpandableFrame } from '@/components/article-expandable';

/**
 * Custom inline markdown parser supporting **bold**, *italic*, _italic_, `inline code`, [links](url), and ![images](url)
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    const imgRegex = /!\[(.*?)\]\((.*?)\)/;
    const linkRegex = /\[(.*?)\]\((.*?)\)/;
    const boldRegex = /\*\*(.*?)\*\*/;
    const italicAsteriskRegex = /\*(.*?)\*/;
    const italicUnderscoreRegex = /_(.*?)_/;
    const codeRegex = /`(.*?)`/;

    const imgMatch = imgRegex.exec(currentText);
    const linkMatch = linkRegex.exec(currentText);
    const boldMatch = boldRegex.exec(currentText);
    const italicAsteriskMatch = italicAsteriskRegex.exec(currentText);
    const italicUnderscoreMatch = italicUnderscoreRegex.exec(currentText);
    const codeMatch = codeRegex.exec(currentText);

    // Find the match with the minimum index
    let firstMatch: {
      type: 'image' | 'link' | 'bold' | 'italic' | 'code';
      index: number;
      length: number;
      content: string;
      extra?: string;
    } | null = null;

    const checkMatch = (match: RegExpExecArray | null, type: 'image' | 'link' | 'bold' | 'italic' | 'code', contentIndex = 1, extraIndex = 2) => {
      if (match) {
        if (!firstMatch || match.index < firstMatch.index) {
          firstMatch = {
            type,
            index: match.index,
            length: match[0].length,
            content: match[contentIndex],
            extra: extraIndex ? match[extraIndex] : undefined,
          };
        }
      }
    };

    checkMatch(imgMatch, 'image', 1, 2);
    checkMatch(linkMatch, 'link', 1, 2);
    checkMatch(boldMatch, 'bold', 1, 0);
    checkMatch(italicAsteriskMatch, 'italic', 1, 0);
    checkMatch(italicUnderscoreMatch, 'italic', 1, 0);
    checkMatch(codeMatch, 'code', 1, 0);

    if (!firstMatch) {
      parts.push(currentText);
      break;
    }

    const { type, index, length, content, extra } = firstMatch;

    // Push the text preceding the match
    if (index > 0) {
      parts.push(currentText.substring(0, index));
    }

    // Push the matched element
    const key = `${type}-${keyIdx++}`;
    if (type === 'image') {
      parts.push(
        <ExpandableFrame key={key} label={content || 'Image'} as="span">
          <img
            src={extra}
            alt={content}
            className="rounded-xl border border-slate-200/90 dark:border-white/10 my-1 max-w-full h-auto"
          />
        </ExpandableFrame>
      );
    } else if (type === 'link') {
      const isExternal = typeof extra === 'string' && (extra as string).startsWith('http');
      parts.push(
        <a
          key={key}
          href={extra}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 decoration-emerald-600/30 dark:decoration-emerald-400/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:decoration-emerald-700 dark:hover:decoration-emerald-300 font-medium"
        >
          {parseInlineMarkdown(content)}
        </a>
      );
    } else if (type === 'bold') {
      parts.push(
        <strong key={key} className="font-semibold text-slate-800 dark:text-slate-100">
          {content}
        </strong>
      );
    } else if (type === 'italic') {
      parts.push(
        <em key={key} className="italic font-normal text-slate-700 dark:text-slate-200">
          {content}
        </em>
      );
    } else if (type === 'code') {
      parts.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-mono"
        >
          {content}
        </code>
      );
    }

    // Move search window past match
    currentText = currentText.substring(index + length);
  }

  return parts;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const BODY =
  'font-body text-slate-700 dark:text-slate-300 text-base md:text-[1.0625rem] leading-[1.8] tracking-normal font-normal text-left';
const H2 =
  'font-headline text-[1.35rem] md:text-[1.65rem] font-[520] dark:font-[480] text-slate-800 dark:text-slate-100 tracking-[-0.015em] mt-14 mb-5 scroll-mt-36';
const H3 =
  'font-headline text-lg md:text-xl font-[520] dark:font-[480] text-slate-800 dark:text-slate-100 tracking-[-0.01em] mt-10 mb-4 scroll-mt-36';
const DEK =
  'font-headline text-[1.05rem] font-medium text-slate-600 dark:text-slate-400 tracking-[-0.01em] mt-1 mb-6 scroll-mt-36 leading-snug';



/**
 * Custom block-level markdown parser converting MD text into premium React nodes
 * with consecutive list item and blockquote grouping.
 */
export function renderMarkdown(
  markdown: string | undefined | null,
  options?: { pageTitle?: string }
): React.ReactNode {
  if (!markdown) return null;
  const pageTitle = options?.pageTitle;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let sawParagraph = false;
  let afterSourcesHeading = false;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Code Block Check
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        const codeContent = codeLines.join('\n');
        elements.push(
          <div 
            key={`code-block-${i}`} 
            className="bg-[#0c1017] border border-slate-800 p-5 rounded-2xl font-mono text-[11px] md:text-xs text-accent overflow-x-auto my-6 shadow-inner"
          >
            <pre className="text-emerald-400 select-all leading-normal">{codeContent}</pre>
          </div>
        );
        codeLines = [];
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3);
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      const id = slugify(text);
      afterSourcesHeading = false;
      elements.push(
        <h3 key={`h3-${i}`} id={id} className={H3}>
          {text}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = slugify(text);
      afterSourcesHeading = id === 'sources';
      elements.push(
        <h2 key={`h2-${i}`} id={id} className={H2}>
          {text}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      const text = line.slice(2).trim();
      afterSourcesHeading = slugify(text) === 'sources';
      i++;
      continue;
    }

    // Blockquote (Emerald left-border, group consecutive blockquote lines)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        const raw = lines[i];
        const content = raw.startsWith('> ') ? raw.slice(2) : raw.slice(1);
        quoteLines.push(content);
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="relative my-10 border-l-[3px] border-emerald-500 dark:border-emerald-400/80 pl-5 sm:pl-6 font-headline font-medium text-[1.125rem] md:text-[1.2rem] leading-[1.65] tracking-[-0.01em] text-slate-800 dark:text-slate-200 not-italic"
        >
          {quoteLines.map((ql, idx) => (
            <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
              {parseInlineMarkdown(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Horizontal rule (not a table separator)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim()) && !line.includes('|')) {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/15 to-transparent"
        />
      );
      i++;
      continue;
    }

    // GFM-style tables: header | sep | rows
    if (isMarkdownTableStart(lines, i)) {
      const { element, nextIndex } = parseMarkdownTable(lines, i);
      elements.push(element);
      i = nextIndex;
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s+/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className={`${BODY} list-none pl-0 my-6 space-y-4`}
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-3">
              <span className="font-label tabular-nums text-slate-400 dark:text-slate-500">
                {idx + 1}
              </span>
              <span>{parseInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // List Items (Bullet Lists, group consecutive bullet points)
    if (line.trim().startsWith('- ')) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className={
            afterSourcesHeading
              ? `${BODY} list-none pl-0 my-4 space-y-4 divide-y divide-slate-200/70 dark:divide-white/10 text-[0.9375rem] md:text-base text-slate-600 dark:text-slate-400 [&>li]:pt-4 [&>li:first-child]:pt-0`
              : `${BODY} list-disc pl-5 my-6 space-y-3 marker:text-slate-400 dark:marker:text-slate-500`
          }
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Standalone image line → figure + optional caption from alt text
    const imgOnly = /^!\[(.*?)\]\((.*?)\)$/.exec(line.trim());
    if (imgOnly) {
      const alt = imgOnly[1].trim();
      const src = imgOnly[2].trim();
      sawParagraph = true;
      elements.push(
        <figure key={`fig-${i}`} className="my-8">
          <ExpandableFrame label={alt || 'Image'}>
            <img
              src={src}
              alt={alt}
              className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 h-auto"
            />
          </ExpandableFrame>
          {alt ? (
            <figcaption className="mt-2.5 text-center font-body text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {alt}
            </figcaption>
          ) : null}
        </figure>
      );
      i++;
      continue;
    }

    // Paragraph
    if (line.trim() !== '') {
      if (!sawParagraph && !/[.!?]"?$/.test(line.trim())) {
        i++;
        continue;
      }
      const isLead = !sawParagraph;
      sawParagraph = true;
      if (afterSourcesHeading && !line.startsWith('#')) {
        /* keep sources muted until a new heading */
      }
      elements.push(
        <p
          key={`p-${i}`}
          className={
            afterSourcesHeading
              ? `${BODY} mb-4 text-[0.9375rem] md:text-base text-slate-600 dark:text-slate-400`
              : isLead
                ? `${BODY} mb-6 text-[1.125rem] md:text-[1.1875rem] leading-[1.75] text-slate-700 dark:text-slate-300`
                : `${BODY} mb-4`
          }
        >
          {parseInlineMarkdown(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-2">{elements}</div>;
}

/** True if lines[i] is a table header and lines[i+1] is a separator row. */
function isMarkdownTableStart(lines: string[], i: number): boolean {
  const header = lines[i]?.trim() ?? '';
  const sep = lines[i + 1]?.trim() ?? '';
  if (!header.includes('|')) return false;
  // Separator: | --- | :---: | ---: |
  if (!/^\|?[\s\-:|]+\|[\s\-:|]*\|?$/.test(sep)) return false;
  if (!sep.includes('-')) return false;
  return true;
}

function splitTableCells(line: string): string[] {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map((c) => c.trim());
}

function parseMarkdownTable(
  lines: string[],
  start: number
): { element: React.ReactNode; nextIndex: number } {
  const headerCells = splitTableCells(lines[start]);
  const sepCells = splitTableCells(lines[start + 1]);
  const aligns = sepCells.map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center' as const;
    if (right) return 'right' as const;
    return 'left' as const;
  });

  const bodyRows: string[][] = [];
  let i = start + 2;
  while (i < lines.length) {
    const row = lines[i].trim();
    if (!row || !row.includes('|')) break;
    // Stop if it looks like a new block (heading, list, etc.) without pipes as table
    if (/^#{1,6}\s/.test(row) || row.startsWith('```')) break;
    bodyRows.push(splitTableCells(lines[i]));
    i++;
  }

  const alignClass = (idx: number) => {
    const a = aligns[idx] || 'left';
    if (a === 'center') return 'text-center';
    if (a === 'right') return 'text-right';
    return 'text-left';
  };

  const wide = headerCells.length >= 4;
  const table = (
    <div
      className="article-table-scroll my-8 w-full overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-950"
    >
      <table
        className={`border-collapse text-left text-sm ${
          wide ? 'w-max min-w-full' : 'w-full'
        }`}
      >
        <thead>
          <tr className="bg-slate-100/90 dark:bg-white/[0.06]">
            {headerCells.map((cell, idx) => (
              <th
                key={idx}
                className={`px-5 py-3.5 font-headline font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-white/10 align-bottom ${
                  wide ? 'whitespace-nowrap' : 'text-pretty'
                } ${
                  idx === 0
                    ? 'sticky left-0 z-[1] bg-slate-100/95 dark:bg-slate-900 border-r border-slate-200/70 dark:border-white/10'
                    : ''
                } ${alignClass(idx)}`}
              >
                {parseInlineMarkdown(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="border-b border-slate-100 dark:border-white/[0.06] last:border-0 odd:bg-white dark:odd:bg-slate-950 even:bg-slate-50/80 dark:even:bg-white/[0.03]"
            >
              {headerCells.map((_, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-5 py-3.5 font-body text-slate-700 dark:text-slate-300 align-top ${
                    wide ? 'whitespace-nowrap' : ''
                  } ${
                    cIdx === 0
                      ? `sticky left-0 z-[1] font-medium border-r border-slate-200/55 dark:border-white/[0.08] ${
                          rIdx % 2 === 0
                            ? 'bg-white dark:bg-slate-950'
                            : 'bg-slate-50 dark:bg-[#0c1220]'
                        }`
                      : 'font-normal'
                  } ${alignClass(cIdx)}`}
                >
                  {parseInlineMarkdown(row[cIdx] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const element = (
    <ExpandableFrame key={`table-${start}`} label="Table">
      {table}
    </ExpandableFrame>
  );

  return { element, nextIndex: i };
}
