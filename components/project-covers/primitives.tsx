import type { ReactNode } from 'react';

export interface CoverSceneProps {
  glassId: string;
  edgeId: string;
}

export function GlassPanel({
  glassId,
  edgeId,
  width,
  height,
  radius = 14,
  children,
}: CoverSceneProps & { width: number; height: number; radius?: number; children?: ReactNode }) {
  return (
    <>
      <rect
        x="6"
        y="9"
        width={width}
        height={height}
        rx={radius}
        fill="var(--cover-ink)"
        opacity=".16"
      />
      <rect
        width={width}
        height={height}
        rx={radius}
        fill={`url(#${glassId})`}
        stroke={`url(#${edgeId})`}
        strokeWidth="2"
      />
      {children}
    </>
  );
}

export function Approval({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="14" fill="var(--cover-highlight)" stroke="var(--cover-accent)" />
      <path d="M-7 0L-2 5L7 -5" stroke="var(--cover-accent)" strokeWidth="2" />
    </g>
  );
}

export function Ground({ width = 180 }: { width?: number }) {
  return <ellipse cx="320" cy="267" rx={width} ry="20" fill="var(--cover-ink)" opacity=".11" />;
}
