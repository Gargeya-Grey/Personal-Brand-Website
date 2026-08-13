'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const InteractiveBackground = dynamic(
  () => import('@/components/interactive-background').then((m) => m.InteractiveBackground),
  { ssr: false, loading: () => null }
);

export function InteractiveBackgroundLazy() {
  const pathname = usePathname();
  if (
    pathname?.startsWith('/editorial') ||
    pathname?.startsWith('/ledger') ||
    pathname?.startsWith('/login')
  ) {
    return null;
  }
  return <InteractiveBackground />;
}
