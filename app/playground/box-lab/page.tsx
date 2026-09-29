import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import { ProjectDetail } from '@/components/project-detail';
import { allWork } from '@/data/selected-work';

const work = allWork.find((entry) => entry.id === 'box-lab')!;
export const metadata: Metadata = getPageMetadata({
  title: work.title + ' · Playground',
  description: work.description,
  path: '/playground/box-lab',
});
export default function Page() {
  return <ProjectDetail work={work} />;
}
