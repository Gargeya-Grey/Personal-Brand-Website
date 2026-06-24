'use client';

import { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import { Play, X, ExternalLink, Flame, Eye, Calendar, Film } from 'lucide-react';
import Image from 'next/image';

interface VideoItem {
  id: string; // Real 11-char YouTube Video ID
  title: string;
  views: string;
  date: string;
  duration: string;
  description: string;
}

// Subcomponent to handle high-resolution thumbnail loading with fallback to standard resolution
function VideoThumbnail({ id, title }: { id: string; title: string }) {
  const [src, setSrc] = useState(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);

  useEffect(() => {
    setSrc(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
  }, [id]);

  return (
    <Image
      src={src}
      alt={title}
      fill
      className="object-cover group-hover/video:scale-105 transition-transform duration-500"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => {
        setSrc(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
      }}
    />
  );
}

export function YoutubeGrid() {
  // Configurable channel URL or all videos page
  const channelUrl = "https://www.youtube.com/@gargeyasharma"; // Replace with your actual channel URL

  // Pre-configured top 3 high-quality educational / AI videos with real thumbnail support.
  const [videos] = useState<VideoItem[]>([
    {
      id: "bUk92KXUh1M",
      title: "Travelling to my Dream Country : Japan🗾 (Part 1: ARRIVAL)",
      views: "259 views",
      date: "3 months ago",
      duration: "27:04",
      description: "Vlog documenting the arrival and first impressions of traveling to Japan, exploring local sights, transport systems, and initial experiences in Tokyo."
    },
    {
      id: "CgmgDAWVdeo",
      title: "Surviving Universal Studios Japan in Winter! 🎢 | Osaka Vlog Part 2",
      views: "167 views",
      date: "3 months ago",
      duration: "27:29",
      description: "A winter adventure vlogging experience at Universal Studios Japan in Osaka, showcasing key attractions, crowd strategies, and winter survival tips."
    },
    {
      id: "TqrgjZOBYqc",
      title: "Osaka's Night Market & Exploring Nara: Todai-ji Temple & Feeding the Local Deer 🇯🇵 | Vlog 03",
      views: "222 views",
      date: "2 months ago",
      duration: "27:04",
      description: "Exploring Osaka's vibrant street food scene at night, visiting the historic Todai-ji Temple in Nara, and interacting with the iconic local deer."
    }
  ]);

  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="space-y-16">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, index) => {
          const isPlaying = playingId === video.id;
          return (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-5 rounded-[2rem] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[border-color,box-shadow] duration-300 ease-out flex flex-col justify-between"
            >
              <div>
                {/* Custom Thumbnail or Embedded Player */}
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 shadow-sm bg-black border border-white/5 group/video cursor-pointer">
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0 z-10"
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 w-full h-full z-10"
                      onClick={() => setPlayingId(video.id)}
                    >
                      {/* Thumbnail Image */}
                      <VideoThumbnail id={video.id} title={video.title} />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors duration-300">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-14 h-14 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg group-hover/video:bg-[#10B981] group-hover/video:border-[#10B981] group-hover/video:text-white text-white transition-all duration-300"
                        >
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </motion.div>
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded text-[10px] md:text-xs text-white font-label font-bold bg-black/75 backdrop-blur-sm border border-white/10 tracking-wider">
                        {video.duration}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata & Description */}
                <h3 className="text-lg font-headline font-extrabold text-primary mb-2 line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                
                <p className="text-on-surface-variant font-body text-sm line-clamp-2 mb-4 leading-relaxed">
                  {video.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant/70 font-label border-t border-outline-variant/10 pt-4 mt-2">
                  <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#10B981]" /> {video.views}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {video.date}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Elegant CTA to view all on YouTube Channel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center pt-8 border-t border-outline-variant/10"
      >
        <div className="text-center max-w-md pb-6 space-y-2">
          <p className="font-label text-xs uppercase tracking-widest text-[#10B981] font-bold">More Playlists & Content</p>
          <p className="font-body text-sm text-on-surface-variant">
            Explore complete lectures on AI architecture, development tutorials, and live-coding sequences.
          </p>
        </div>

        <a 
          href={channelUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 bg-primary dark:bg-accent text-white dark:text-slate-950 px-8 py-4 rounded-full font-headline font-bold text-sm tracking-tight transition-all duration-300 active:scale-95 shadow-md hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:bg-[#10B981] dark:hover:bg-accent/90"
        >
          <Film className="w-4 h-4" />
          <span>View All Videos on YouTube</span>
          <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </motion.div>
    </div>
  );
}
