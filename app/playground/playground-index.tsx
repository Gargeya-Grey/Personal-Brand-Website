'use client';
import { PlaygroundSampler } from '@/components/playground-sampler';
import { WorkVisual } from '@/components/work-visual';
import { useState } from 'react';
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
      <div className="project-shelf">
        {visible.map((entry) => (
          <article
            key={entry.id}
            className={entry.kind === 'In your browser' ? 'shelf-playable' : ''}
          >
            {entry.id === 'box-lab' || entry.id === 'idea-mixer' ? (
              <PlaygroundSampler id={entry.id} />
            ) : (
              <Link
                href={entry.href}
                aria-label={'Explore ' + entry.title}
                target={entry.href.startsWith('https://') ? '_blank' : undefined}
                rel={entry.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
              >
                <WorkVisual id={entry.id} />
              </Link>
            )}
            <div className="shelf-copy">
              <p className="field-label">
                {entry.kind} / {entry.status}
              </p>
              <h2>
                <Link
                  href={entry.href}
                  target={entry.href.startsWith('https://') ? '_blank' : undefined}
                  rel={entry.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                >
                  {entry.title}
                </Link>
              </h2>
              <p>{entry.description}</p>
              <div className="field-actions">
                {entry.href && (
                  <Link
                    href={entry.href}
                    className="field-text-link"
                    target={entry.href.startsWith('https://') ? '_blank' : undefined}
                    rel={entry.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                  >
                    {entry.action}
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
