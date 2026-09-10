'use client';

import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Play, ExternalLink, Eye, Calendar, Film } from 'lucide-react';
import Image from 'next/image';
import { siteConfig } from '@/lib/site-config';

interface VideoItem {
  id: string;
  title: string;
  views: string;
  date: string;
  duration: string;
  description: string;
}

function VideoThumbnail({ id, title }: { id: string; title: string }) {
  return (
    <Image
      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
      alt={title}
      fill
      loading="lazy"
      className="object-cover group-hover/video:scale-105 transition-transform duration-500"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

export const VIDEOS: VideoItem[] = [
  {
    id: 'bUk92KXUh1M',
    title: 'Travelling to my Dream Country : Japan🗾 (Part 1: ARRIVAL)',
    views: '259 views',
    date: '3 months ago',
    duration: '27:04',
    description:
      'Arrival and first impressions — transport systems, Tokyo texture, and the start of the Japan series.',
  },
  {
    id: 'CgmgDAWVdeo',
    title: 'Surviving Universal Studios Japan in Winter! 🎢 | Osaka Vlog Part 2',
    views: '167 views',
    date: '3 months ago',
    duration: '27:29',
    description:
      'Winter at Universal Studios Japan — crowd strategy, key attractions, and on-the-ground pacing.',
  },
  {
    id: 'TqrgjZOBYqc',
    title: "Osaka's Night Market & Exploring Nara | Vlog 03",
    views: '222 views',
    date: '2 months ago',
    duration: '27:04',
    description:
      'Osaka night food, Todai-ji Temple in Nara, and the iconic local deer — slower travel essay energy.',
  },
];

export function YoutubeGrid() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      <div className="mb-2 flex items-center gap-4">
        <span className="font-label text-xs uppercase tracking-[0.25em] text-accent font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Earlier films
        </span>
        <div className="h-[1px] bg-emerald-500/25 dark:bg-white/10 flex-grow" />
        <span className="font-label text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
          {VIDEOS.length} {VIDEOS.length === 1 ? 'video' : 'videos'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {VIDEOS.map((video, index) => (
          <motion.article
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5%' }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group/video board-card rounded-[1.75rem] overflow-hidden flex flex-col"
          >
            <div className="relative aspect-video bg-slate-900">
              {playingId === video.id ? (
                <iframe
                  title={video.title}
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlayingId(video.id)}
                  className="absolute inset-0 w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  aria-label={`Play ${video.title}`}
                >
                  <VideoThumbnail id={video.id} title={video.title} />
                  <div className="absolute inset-0 bg-slate-950/25 group-hover/video:bg-slate-950/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-accent text-slate-950 flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </span>
                  </div>
                  <span className="absolute bottom-3 right-3 text-[11px] font-mono bg-black/70 text-white px-2 py-0.5 rounded-md">
                    {video.duration}
                  </span>
                </button>
              )}
            </div>

            <div className="p-6 space-y-3 flex-grow flex flex-col">
              <h3 className="font-headline font-bold text-primary text-lg leading-snug line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 flex-grow">
                {video.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-label text-on-surface-variant/80 uppercase tracking-wider pt-1">
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {video.views}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {video.date}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-headline text-xl font-bold tracking-tight text-primary sm:text-2xl">
            More on the channel
          </p>
          <p className="max-w-md font-body text-sm leading-relaxed text-on-surface-variant">
            Early films stay on the channel. New work starts here soon.
          </p>
          <a
            href={siteConfig.links.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent inline-flex items-center gap-2 h-12 px-8 rounded-2xl font-headline font-bold text-sm"
          >
            <Film className="btn-icon w-4 h-4" />
            Open full channel
            <ExternalLink className="btn-icon w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
