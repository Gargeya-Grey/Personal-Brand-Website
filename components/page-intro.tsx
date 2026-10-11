import type { ReactNode } from 'react';
export function PageIntro({
  title,
  titleId,
  children,
}: {
  title: ReactNode;
  /** Gives the heading an id, so a page's margin dots can follow it. */
  titleId?: string;
  children: ReactNode;
}) {
  return (
    <header className="field-intro" data-reveal>
      <h1 id={titleId}>{title}</h1>
      <div className="field-intro-copy">{children}</div>
    </header>
  );
}
