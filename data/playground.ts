import type { ProjectCover } from '@/lib/project-cover';
import { allWork } from './selected-work';

export type WorkKind = 'In your browser' | 'Software' | 'Experiments';
export interface PlaygroundEntry {
  id: string;
  /** Kept for the project pages and the cover check; the Playground index shows dot glyphs instead. */
  cover: ProjectCover;
  title: string;
  /** The question or claim the project answers. It leads each row. */
  subtitle: string;
  description: string;
  /** What the tool supports, step by step. Empty when the project has no process to show. */
  steps: readonly string[];
  kind: WorkKind;
  status: string;
  href: string;
  action: string;
  source?: string;
}

/** The entry that opens the index at a larger size, as Edudojo does on the homepage. */
export const leadEntryId = 'edudojo';

const order = [
  'edudojo',
  'evals',
  'box-lab',
  'idea-mixer',
  'odicto',
  'twinaatma',
  'dataclean',
  'personal-brand',
];
const orderedWork = [...allWork].sort((a, b) => {
  const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);
  return rank(a.id) - rank(b.id);
});

export const playgroundEntries: PlaygroundEntry[] = orderedWork.map((work) => ({
  id: work.id,
  cover: work.cover,
  title: work.title,
  subtitle: work.subtitle,
  description: work.description,
  steps: work.steps,
  kind: work.kind ?? (work.id === 'dataclean' ? 'Experiments' : 'Software'),
  status:
    work.id === 'evals'
      ? 'Public results'
      : work.demo
        ? 'Playable demo'
        : work.recordings?.length
          ? 'Video walkthrough'
          : work.category,
  href: '/playground/' + work.id,
  action:
    work.id === 'evals'
      ? 'View the dashboard'
      : work.demo
        ? 'Open & play'
        : work.recordings?.length
          ? 'See it in action'
          : 'Explore the project',
  source: work.source,
}));
