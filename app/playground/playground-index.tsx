'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { ProcessPath } from '@/components/process-path';
import type { PlaygroundEntry, WorkKind } from '@/data/playground';

/** Reading order of the groups, each with the heading the margin dots follow. */
const groups: readonly { kind: WorkKind; id: string; heading: ReactNode }[] = [
  {
    kind: 'Software',
    id: 'playground-software',
    heading: (
      <>
        Software. <em>Tools for learning, voice, and memory.</em>
      </>
    ),
  },
  {
    kind: 'In your browser',
    id: 'playground-browser',
    heading: (
      <>
        Playable. <em>Open one and try it, with no account.</em>
      </>
    ),
  },
  {
    kind: 'Experiments',
    id: 'playground-experiments',
    heading: (
      <>
        Experiments. <em>Questions tested in code, with the evidence shown.</em>
      </>
    ),
  },
];

const isExternal = (href: string) => href.startsWith('https://');
const linkTarget = (href: string) =>
  isExternal(href)
    ? ({ target: '_blank', rel: 'noopener noreferrer' } as const)
    : ({} as Record<string, never>);

function EntryMeta({ entry }: { entry: PlaygroundEntry }) {
  return (
    <p className="work-meta">
      <span>{entry.title}</span>
      <span>{entry.kind}</span>
      <span>{entry.status}</span>
    </p>
  );
}

/** The links under an entry. They sit above the row-wide title link so each stays clickable. */
function EntryActions({ entry }: { entry: PlaygroundEntry }) {
  return (
    <div className="field-actions playground-actions">
      <Link href={entry.href} className="field-text-link" {...linkTarget(entry.href)}>
        {entry.action}
        <ArrowUpRight size={16} />
      </Link>
      {entry.source && (
        <a href={entry.source} target="_blank" rel="noopener noreferrer" className="field-text-link">
          View source <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}

export function PlaygroundIndex({
  entries,
  leadEntryId,
  leadGlyph,
  rowGlyphs,
}: {
  entries: PlaygroundEntry[];
  leadEntryId: string;
  leadGlyph: ReactNode;
  rowGlyphs: Record<string, ReactNode>;
}) {
  const [kind, setKind] = useState<WorkKind | 'All'>('All');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visible = entries.filter(
    (entry) =>
      (kind === 'All' || entry.kind === kind) &&
      (entry.title + ' ' + entry.subtitle + ' ' + entry.description)
        .toLowerCase()
        .includes(normalizedQuery),
  );
  return (
    <>
      <div className="playground-toolbar">
        <div className="playground-filters" role="group" aria-label="Filter projects">
          {(['All', 'In your browser', 'Software', 'Experiments'] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <label className="playground-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            placeholder="Search projects"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="field-label" role="status">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'} to explore
      </p>
      {groups.map((group) => {
        const groupEntries = visible.filter((entry) => entry.kind === group.kind);
        if (!groupEntries.length) return null;
        const leadEntry = groupEntries.find((entry) => entry.id === leadEntryId);
        const rowEntries = groupEntries.filter((entry) => entry.id !== leadEntryId);
        return (
          <section key={group.kind} className="playground-group" aria-labelledby={group.id}>
            <header className="playground-group-head">
              <h2 id={group.id}>{group.heading}</h2>
            </header>
            {leadEntry && (
              <article className="playground-lead playground-item glyph-host">
                <div className="playground-lead-glyph" aria-hidden="true">
                  {leadGlyph}
                </div>
                <div className="playground-lead-copy">
                  <EntryMeta entry={leadEntry} />
                  <h3 className="playground-lead-title">
                    <Link href={leadEntry.href} {...linkTarget(leadEntry.href)}>
                      {leadEntry.subtitle}
                    </Link>
                  </h3>
                  <p className="playground-description">{leadEntry.description}</p>
                  <ProcessPath steps={leadEntry.steps} />
                  <EntryActions entry={leadEntry} />
                </div>
              </article>
            )}
            {rowEntries.length > 0 && (
              <ul className="work-index playground-list">
                {rowEntries.map((entry) => (
                  <li key={entry.id} className="work-row playground-row playground-item glyph-host">
                    {rowGlyphs[entry.id]}
                    <div className="work-row-copy">
                      <EntryMeta entry={entry} />
                      <h3 className="work-row-title">
                        <Link href={entry.href} {...linkTarget(entry.href)}>
                          {entry.subtitle}
                        </Link>
                      </h3>
                      <p className="playground-description">{entry.description}</p>
                      <ProcessPath steps={entry.steps} />
                      <EntryActions entry={entry} />
                    </div>
                    <ArrowUpRight size={20} className="work-row-arrow" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {!visible.length && (
        <div className="experiment-surface">
          <h2>No projects match that search.</h2>
          <p className="field-copy">Try another search, or see the full collection.</p>
          <button
            className="field-button mt-6"
            onClick={() => {
              setKind('All');
              setQuery('');
            }}
          >
            Show everything
          </button>
        </div>
      )}
    </>
  );
}
