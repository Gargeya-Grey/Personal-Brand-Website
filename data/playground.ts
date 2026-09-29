import { allWork } from './selected-work';

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

const order = [
  'box-lab',
  'idea-mixer',
  'edudojo',
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
  title: work.title,
  description: work.description,
  kind: work.kind ?? (work.id === 'dataclean' ? 'Experiments' : 'Software'),
  status: work.demo
    ? 'Playable demo'
    : work.recordings?.length
      ? 'Video walkthrough'
      : work.category,
  href: '/playground/' + work.id,
  action: work.demo
    ? 'Open & play'
    : work.recordings?.length
      ? 'See it in action'
      : 'Explore the project',
  source: work.source,
}));
