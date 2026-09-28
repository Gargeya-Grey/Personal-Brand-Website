import type { ReactNode } from 'react';
export function PageIntro({
  number,
  eyebrow,
  title,
  children,
}: {
  number: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <header className="field-intro" data-reveal>
      <p className="field-label">
        <span>{number} /</span> {eyebrow}
      </p>
      <h1>{title}</h1>
      <div className="field-intro-copy">{children}</div>
    </header>
  );
}
