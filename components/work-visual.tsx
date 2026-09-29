import Image from 'next/image';
import { useId } from 'react';
import type { ProjectCover } from '@/lib/project-cover';
import { coverScenes } from '@/components/project-covers/scenes';

/** Shared cover frame. Project identity belongs in metadata and its SVG scene. */
export function WorkVisual({ cover }: { cover: ProjectCover }) {
  const unique = useId();
  const glassId = unique + '-glass';
  const edgeId = unique + '-edge';
  if (cover.kind === 'image') {
    return (
      <div className="work-visual project-cover" data-cover-kind="image" aria-hidden="true">
        <Image
          src={cover.src}
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 650px"
          className="project-cover-image"
          style={{ objectPosition: cover.position }}
        />
      </div>
    );
  }
  const Scene = coverScenes[cover.scene];
  return (
    <div
      className="work-visual project-cover"
      data-cover-kind="svg"
      data-scene={cover.scene}
      data-palette={cover.palette}
      aria-hidden="true"
    >
      <svg className="project-cover-drawing" viewBox="0 0 640 320" fill="none">
        <defs>
          <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--cover-highlight)" stopOpacity=".94" />
            <stop offset=".48" stopColor="var(--cover-glass)" stopOpacity=".4" />
            <stop offset="1" stopColor="var(--cover-edge)" stopOpacity=".12" />
          </linearGradient>
          <linearGradient id={edgeId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--cover-highlight)" />
            <stop offset=".5" stopColor="var(--cover-glass)" />
            <stop offset="1" stopColor="var(--cover-ink)" />
          </linearGradient>
        </defs>
        <Scene glassId={glassId} edgeId={edgeId} />
      </svg>
      <div className="project-cover-caption">
        <span>{cover.label}</span>
        <span>{cover.detail}</span>
      </div>
    </div>
  );
}
