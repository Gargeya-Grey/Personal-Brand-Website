import { projects } from './projects';

export type WorkKind = 'Apps' | 'Websites' | 'Advisory';
export interface PlaygroundEntry {
  id: string;
  title: string;
  description: string;
  kind: WorkKind;
  status: string;
  href?: string;
  source?: string;
  image?: string;
}

/** Add an internal app route or an HTTPS deployment here to publish it in the index. */
export const playgroundEntries: PlaygroundEntry[] = [
  {
    id: 'idea-mixer',
    title: 'Idea mixer',
    description:
      'Combine an everyday audience with an unexpected constraint. Keep the prompts that spark something and turn one into a small experiment.',
    kind: 'Apps',
    status: 'Interactive experiment',
    href: '/playground/idea-mixer',
  },
  ...projects.map((project): PlaygroundEntry => ({
    id: project.id,
    title: project.id === 'personal-brand' ? 'The personal corner' : project.title,
    description:
      project.id === 'personal-brand'
        ? 'This website, open source. A personal home for writing, videos, experiments, and a growing body of work.'
        : project.description,
    kind:
      project.id === 'systems-thinking'
        ? 'Advisory'
        : project.id === 'edudojo'
          ? 'Apps'
          : 'Websites',
    status: project.category,
    href: project.link,
    source: project.github,
    image: project.image,
  })),
];
