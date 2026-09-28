import { allWork, selectedWork } from './selected-work';

export type WorkKind = 'In your browser' | 'Software' | 'Experiments';
export interface PlaygroundEntry {
  id: string;
  title: string;
  description: string;
  kind: WorkKind;
  status: string;
  href: string;
  action: string;
  source?: string;
}

/** Add a working route/deployment and a truthful destination label to publish a project. */
export const playgroundEntries: PlaygroundEntry[] = [
  {
    id: 'box-lab',
    title: 'The overlap lab',
    kind: 'In your browser',
    status: 'Interactive · no account',
    href: '/playground/box-lab',
    action: 'Try the experiment',
    description:
      'When does a predicted box count as a match? Move it, resize it, and see how computer vision measures overlap.',
  },
  {
    id: 'idea-mixer',
    title: 'Idea mixer',
    kind: 'In your browser',
    status: 'Creative tool · no account',
    href: '/playground/idea-mixer',
    action: 'Mix an idea',
    description:
      'Combine an audience with an unexpected constraint. Save the prompts that spark something and turn one into an experiment.',
  },
  ...[...selectedWork, ...allWork.filter((work) => work.id === 'dataclean')].map(
    (work): PlaygroundEntry => ({
      id: work.id,
      title: work.title,
      description: work.description,
      kind: work.id === 'dataclean' ? 'Experiments' : 'Software',
      status: work.category,
      href: '/playground/' + work.id,
      action: 'Explore the project',
      source: work.source,
    }),
  ),
  {
    id: 'personal-brand',
    title: 'This website',
    kind: 'Experiments',
    status: 'Public source',
    description:
      'The code behind the journal, publishing workspace, and these browser experiments. A growing home for the work.',
    href: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
    action: 'Read the source',
  },
];
