'use client';

import { useState } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import Image from 'next/image';

interface VideoItem {
  id: string;
  title: string;
  /** Which part of the Japan series this is, taken from the video's own title. */
  part: string;
  duration: string;
  description: string;
}

function VideoThumbnail({ id, title, isFirst }: { id: string; title: string; isFirst: boolean }) {
  return (
    <Image
      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
      alt={title}
      fill
      loading={isFirst ? 'eager' : 'lazy'}
      fetchPriority={isFirst ? 'high' : 'auto'}
      className="films-thumb-image"
      sizes="(max-width: 760px) 100vw, 420px"
    />
  );
}

export const VIDEOS: VideoItem[] = [
  {
    id: 'bUk92KXUh1M',
    title: 'Travelling to my Dream Country : Japan🗾 (Part 1: ARRIVAL)',
    part: 'Part 1',
    duration: '27:04',
    description:
      'Arrival and first impressions — transport systems, Tokyo texture, and the start of the Japan series.',
  },
  {
    id: 'CgmgDAWVdeo',
    title: 'Surviving Universal Studios Japan in Winter! 🎢 | Osaka Vlog Part 2',
    part: 'Part 2',
    duration: '27:29',
    description:
      'Winter at Universal Studios Japan — crowd strategy, key attractions, and on-the-ground pacing.',
  },
  {
    id: 'TqrgjZOBYqc',
    title: "Osaka's Night Market & Exploring Nara | Vlog 03",
    part: 'Part 3',
    duration: '27:04',
    description:
      'Osaka night food, Todai-ji Temple in Nara, and the iconic local deer — slower travel essay energy.',
  },
];

/** The films as an index: a real thumbnail framed with a hairline, then what it is, in the shared grammar. */
export function YoutubeGrid() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <>
      <header className="films-section-head">
        <h2 className="work-meta films-section-label">
          <span>From Japan</span>
          <span>The travel films</span>
          <span>{VIDEOS.length} films</span>
        </h2>
        <span className="films-aside">Pick a film. Stay a while.</span>
      </header>
      <ul className="films-index">
        {VIDEOS.map((video, index) => {
          const isPlaying = playingId === video.id;
          return (
            <li key={video.id} className="films-row" data-reveal>
              <div className="films-frame">
                {isPlaying ? (
                  <iframe
                    title={video.title}
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlayingId(video.id)}
                    className="films-play"
                    aria-label={`Play ${video.title}`}
                  >
                    <VideoThumbnail id={video.id} title={video.title} isFirst={index === 0} />
                    <span className="films-play-disc" aria-hidden="true">
                      <Play size={22} fill="currentColor" />
                    </span>
                    <span className="films-duration">{video.duration}</span>
                  </button>
                )}
              </div>
              <div className="films-copy">
                <p className="work-meta">
                  <span>Japan</span>
                  <span>{video.part}</span>
                </p>
                <h3 className="films-title">{video.title}</h3>
                <p className="films-description">{video.description}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-text-link films-link"
                >
                  Watch on YouTube <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
