import React from 'react';

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
        <img
          key={key}
          src={extra}
          alt={content}
          className="rounded-xl border border-slate-200 dark:border-slate-800 shadow my-4 max-w-full h-auto inline-block"
        />
      );
    } else if (type === 'link') {
      const isExternal = typeof extra === 'string' && (extra as string).startsWith('http');
      parts.push(
        <a
          key={key}
          href={extra}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 decoration-emerald-600/30 dark:decoration-emerald-400/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:decoration-emerald-700 dark:hover:decoration-emerald-300 transition-all font-medium"
        >
          {parseInlineMarkdown(content)}
        </a>
      );
    } else if (type === 'bold') {
      parts.push(
        <strong key={key} className="font-bold text-slate-900 dark:text-white">
          {content}
        </strong>
      );
    } else if (type === 'italic') {
      parts.push(
        <em key={key} className="italic text-slate-900 dark:text-white font-[450] dark:font-[400]">
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

/**
 * Custom block-level markdown parser converting MD text into premium React nodes
 * with consecutive list item and blockquote grouping.
 */
export function renderMarkdown(markdown: string | undefined | null): React.ReactNode {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

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
            className="bg-[#0c1017] border border-slate-800 p-5 rounded-2xl font-mono text-[11px] md:text-xs text-[#10B981] overflow-x-auto my-6 shadow-inner"
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
      elements.push(
        <h3 key={`h3-${i}`} id={id} className="text-xl md:text-2xl font-headline font-[520] dark:font-[480] text-slate-900 dark:text-white tracking-[-0.005em] mt-8 mb-4 scroll-mt-32">
          {text}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = slugify(text);
      elements.push(
        <h2 key={`h2-${i}`} id={id} className="text-2xl md:text-3.5xl font-headline font-[520] dark:font-[480] text-slate-900 dark:text-white tracking-[-0.01em] mt-10 mb-5 scroll-mt-32">
          {text}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      const text = line.slice(2).trim();
      const id = slugify(text);
      elements.push(
        <h1 key={`h1-${i}`} id={id} className="text-3xl md:text-4.5xl font-headline font-[520] dark:font-[480] text-slate-900 dark:text-white tracking-[-0.01em] mt-12 mb-6 leading-tight">
          {text}
        </h1>
      );
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
          className="font-semibold text-slate-900 dark:text-white text-base md:text-lg border-l-[6px] border-emerald-500 pl-5 py-2.5 italic bg-emerald-50/50 dark:bg-emerald-950/15 pr-5 rounded-r-2xl my-6"
        >
          {quoteLines.map((ql, idx) => (
            <p key={idx} className={idx > 0 ? "mt-2" : ""}>
              {parseInlineMarkdown(ql)}
            </p>
          ))}
        </blockquote>
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
        <ul key={`ul-${i}`} className="list-disc pl-6 space-y-2 mb-4 font-body text-slate-700 dark:text-white/80 text-base md:text-lg font-[320] dark:font-[300] leading-relaxed tracking-[0.015em]">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Paragraph
    if (line.trim() !== '') {
      elements.push(
        <p 
          key={`p-${i}`} 
          className="font-body text-slate-700 dark:text-white/80 leading-relaxed tracking-[0.015em] text-base md:text-lg mb-4 font-[320] dark:font-[300]"
        >
          {parseInlineMarkdown(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-2">{elements}</div>;
}
