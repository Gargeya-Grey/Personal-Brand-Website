'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import type { PlaygroundEntry, WorkKind } from '@/data/playground';

export function PlaygroundIndex({ entries }: { entries: PlaygroundEntry[] }) {
  const [kind, setKind] = useState<WorkKind | 'All'>('All');
  const [query, setQuery] = useState('');
  const visible = entries.filter(
    (entry) =>
      (kind === 'All' || entry.kind === kind) &&
      (entry.title + ' ' + entry.description).toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="playground-toolbar">
        <div className="playground-filters" role="group" aria-label="Filter projects">
          {(['All', 'Apps', 'Websites', 'Advisory'] as const).map((value) => (
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
            placeholder="Find something…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="field-label" role="status">
        {visible.length} {visible.length === 1 ? 'thing' : 'things'} to explore
      </p>
      <div className="project-shelf">
        {visible.map((entry) => (
          <article key={entry.id}>
            <div className={'shelf-art ' + (entry.id === 'idea-mixer' ? 'mixer' : '')}>
              {entry.image ? (
                <Image src={entry.image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
              ) : (
                <span className="mix-disc" aria-hidden="true">
                  ?
                </span>
              )}
            </div>
            <div className="shelf-copy">
              <p className="field-label">
                {entry.kind} / {entry.status}
              </p>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
              <div className="field-actions">
                {entry.href && (
                  <Link
                    href={entry.href}
                    className="field-text-link"
                    target={entry.href.startsWith('https://') ? '_blank' : undefined}
                    rel={entry.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                  >
                    {entry.kind === 'Advisory' ? 'Let’s talk' : 'Open project'}
                    <ArrowUpRight size={16} />
                  </Link>
                )}
                {entry.source && (
                  <a
                    href={entry.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="field-text-link"
                  >
                    View source <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="experiment-surface">
          <h2>Nothing in this corner yet.</h2>
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
