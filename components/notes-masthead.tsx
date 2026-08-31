import Link from 'next/link';
import { notesBrand } from '@/lib/notes-brand';

export function NotesMasthead({
  size = 'letter',
  href,
}: {
  size?: 'hero' | 'letter';
  href?: string;
}) {
  const hero = size === 'hero';
  const title = (
    <span
      className={
        hero
          ? 'font-display text-5xl font-medium tracking-[-0.035em] text-primary sm:text-6xl'
          : 'font-display text-[2rem] font-medium tracking-[-0.03em] text-primary sm:text-4xl'
      }
    >
      {notesBrand.name}
    </span>
  );

  return (
    <div className="notes-masthead">
      <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.22em] text-accent">
        {notesBrand.kicker}
      </p>
      <p className={hero ? 'mt-3' : 'mt-2'}>{href ? <Link href={href}>{title}</Link> : title}</p>
      <p
        className={
          hero
            ? 'mt-4 max-w-xl font-headline text-xl font-medium italic tracking-[-0.02em] text-on-surface-variant sm:text-2xl'
            : 'mt-2 font-headline text-base italic tracking-[-0.015em] text-on-surface-variant sm:text-lg'
        }
      >
        {notesBrand.tagline}
      </p>
      <span className="notes-masthead-rule" aria-hidden="true" />
    </div>
  );
}
