import type { ReactNode } from 'react';
export function PageIntro({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <header className="field-intro" data-reveal>
      <h1>{title}</h1>
      <div className="field-intro-copy">{children}</div>
    </header>
  );
}
