'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Play } from 'lucide-react';
import type { ProjectFilm as Film } from '@/lib/project-media';
import type { ProjectCover } from '@/lib/project-cover';

/** Player options: no related videos from other channels, no annotations, inline on phones. */
const playerQuery = 'autoplay=1&rel=0&playsinline=1&iv_load_policy=3&color=white';

/**
 * The demo film in the cover's place: the same sage plate and captions as a glyph plate, with the
 * film as its screen. Nothing loads from YouTube until the visitor presses play.
 */
export function ProjectFilm({ film, cover }: { film: Film; cover: ProjectCover }) {
  const [playing, setPlaying] = useState(false);
  const player = useRef<HTMLIFrameElement>(null);
  // The play button unmounts on press; hand keyboard focus to the player that replaces it.
  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);
  const label = cover.kind === 'svg' ? cover.label : undefined;
  const detail = cover.kind === 'svg' ? cover.detail : undefined;

  return (
    <figure id="film" className="project-film">
      <div className="film-plate">
        <div className="film-screen" data-playing={playing || undefined}>
          {playing ? (
            <iframe
              ref={player}
              title={film.title}
              src={`https://www.youtube-nocookie.com/embed/${film.youtubeId}?${playerQuery}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="film-play"
              onClick={() => setPlaying(true)}
              aria-label={`Watch the film: ${film.title} (${film.duration})`}
            >
              <Image
                src={`https://i.ytimg.com/vi/${film.youtubeId}/maxresdefault.jpg`}
                alt=""
                fill
                priority
                sizes="(max-width: 700px) 100vw, 1200px"
                className="film-poster"
              />
              <span className="film-cue" aria-hidden="true">
                <span className="film-disc">
                  <Play size={22} fill="currentColor" />
                </span>
                <span className="film-cue-text">
                  Watch the film <span className="film-duration">{film.duration}</span>
                </span>
              </span>
            </button>
          )}
        </div>
        {(label || detail) && (
          <div className="film-plate-captions" aria-hidden="true">
            <span>{label}</span>
            <span>{detail}</span>
          </div>
        )}
      </div>
      <figcaption className="film-caption">
        <p>{film.caption}</p>
        <a
          href={`https://www.youtube.com/watch?v=${film.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="field-text-link"
        >
          Watch on YouTube <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
