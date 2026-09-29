import type { Metadata } from 'next';
import { ProjectDetail } from '@/components/project-detail';
import { allWork } from '@/data/selected-work';

const work = allWork.find((entry) => entry.id === 'box-lab')!;
export const metadata: Metadata = {
  title: work.title + ' · Playground',
  description: work.description,
  alternates: { canonical: '/playground/box-lab' },
};
export default function Page() {
  return <ProjectDetail work={work} />;
}
