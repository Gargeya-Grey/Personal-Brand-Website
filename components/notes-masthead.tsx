import Link from 'next/link';
import { notesBrand } from '@/lib/notes-brand';

/** The letter's name. The hero is the page title in two tones; the letter size is a small running head. */
export function NotesMasthead({
  size = 'letter',
  href,
}: {
  size?: 'hero' | 'letter';
  href?: string;
}) {
  const isHero = size === 'hero';

  if (isHero) {
    return (
      <div className="notes-masthead notes-masthead-hero">
        <p className="notes-eyebrow">
          <span className="status-dot" aria-hidden="true" /> {notesBrand.kicker}
        </p>
        <h1 id="notes-title">
          {notesBrand.name}. <em>{notesBrand.tagline}</em>
        </h1>
      </div>
    );
  }

  return (
    <p className="notes-masthead notes-masthead-letter">
      {href ? <Link href={href}>{notesBrand.name}</Link> : <span>{notesBrand.name}</span>}
      <span>{notesBrand.kicker}</span>
    </p>
  );
}
