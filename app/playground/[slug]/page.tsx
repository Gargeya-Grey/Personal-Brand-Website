import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/project-detail';
import { allWork } from '@/data/selected-work';
import {
  getSoftwareApplicationJsonLd,
  getVideoObjectJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';

export const dynamicParams = false;
export function generateStaticParams() {
  return allWork.map(({ id }) => ({ slug: id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = allWork.find((entry) => entry.id === slug);
  if (!work) return {};
  return getPageMetadata({
    title: work.seo?.title ?? work.title + ' · Playground',
    description: work.seo?.description ?? work.description,
    path: '/playground/' + slug,
  });
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = allWork.find((entry) => entry.id === slug);
  if (!work) notFound();
  return (
    <>
      {work.software && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getSoftwareApplicationJsonLd({ ...work, software: work.software })),
          }}
        />
      )}
      {work.film && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getVideoObjectJsonLd({ id: work.id, film: work.film })),
          }}
        />
      )}
      <ProjectDetail work={work} />
    </>
  );
}
