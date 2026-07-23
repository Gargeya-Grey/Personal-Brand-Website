'use client';

import dynamic from 'next/dynamic';

const InteractiveBackground = dynamic(
  () =>
    import('@/components/interactive-background').then((m) => m.InteractiveBackground),
  { ssr: false }
);

export function InteractiveBackgroundLazy() {
  return <InteractiveBackground />;
}
