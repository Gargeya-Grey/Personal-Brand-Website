'use client';

import { useState } from 'react';
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

export function YoutubeGrid() {
  // Configurable channel URL or all videos page
  const channelUrl = "https://www.youtube.com/@gargeyasharma"; // Replace with your actual channel URL

  // Pre-configured top 3 high-quality educational / AI videos with real thumbnail support.
  // Replace these IDs ("AitC_V23Vv8", "U3NYPrAxl-c", "F3_RE-3Yp9s") with your real YouTube video IDs.
  const [videos] = useState<VideoItem[]>([
    {
      id: "AitC_V23Vv8",
      title: "How Transformers & LLM Architectures Actually Calculate Intelligence",
      views: "1.2K views",
      date: "2 days ago",
      duration: "14:20",
      description: "Deconstructing the matrix mathematics of self-attention mechanisms behind modern generative intelligence."
    },
    {
      id: "U3NYPrAxl-c",
      title: "Venture Architecture: Building AI Startups from Zero to Code Validation",
      views: "4.8K views",
      date: "1 week ago",
      duration: "22:15",
      description: "A deep dive into bridging rigid software complexity with fluid venture agility, scaling systems from prototype to production."
    },
    {
      id: "F3_RE-3Yp9s",
      title: "Designing Infinite-Scale Low Latency Assessment Protocols",
      views: "2.3K views",
      date: "3 weeks ago",
      duration: "18:45",
      description: "Architectural overview on rebuilding evaluations and dynamic testing framework structures with distributed consensus."
    }
  ]);

  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <div className="space-y-16">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, index) => {
          // Construct live high-quality thumbnail URL directly from YouTube CDN
          const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
          
          return (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white/40 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 hover:bg-white/70 hover:border-white hover:shadow-[0_16px_40px_rgba(16,185,129,0.08)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Layer with play state trigger */}
                <div 
                  onClick={() => setActiveVideo(video)}
                  className="relative aspect-video rounded-2xl overflow-hidden mb-5 shadow-sm group-hover:shadow-md cursor-pointer group/thumb"
                >
                  <Image 
                    src={thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale group-hover/thumb:grayscale-0 group-hover/thumb:scale-[1.03] transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Backdrop overlay */}
                  <div className="absolute inset-0 bg-primary/20 group-hover/thumb:bg-primary/5 transition-colors duration-500" />
                  
                  {/* Duration Badge */}
                  <span className="absolute bottom-3 right-3 bg-primary/80 backdrop-blur-md px-2.5 py-1 rounded-md text-white font-mono text-[10px] tracking-wider font-extrabold shadow-sm">
                    {video.duration}
                  </span>

                  {/* Play circle trigger button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover/thumb:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 text-[#10B981] fill-[#10B981] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Metadata & Description */}
                <h3 
                  onClick={() => setActiveVideo(video)}
                  className="text-lg font-headline font-extrabold text-primary mb-2 cursor-pointer hover:text-[#10B981] transition-colors duration-300 line-clamp-2 leading-snug"
                >
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
          className="group inline-flex items-center gap-3 bg-primary hover:bg-[#10B981] text-white px-8 py-4 rounded-full font-headline font-bold text-sm tracking-tight transition-all duration-300 active:scale-95 shadow-md hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]"
        >
          <Film className="w-4 h-4" />
          <span>View All Videos on YouTube</span>
          <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </motion.div>

      {/* Immersive Cinematic Overlay Modal for Video Embeds */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-primary/90 backdrop-blur-xl transition-all duration-500">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveVideo(null)} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-5xl bg-surface rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/10 z-10 flex flex-col md:flex-row"
          >
            {/* Direct video embed frame responsive scale */}
            <div className="flex-grow aspect-video bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&showinfo=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Sidebar metadata */}
            <div className="w-full md:w-80 p-6 md:p-8 flex flex-col justify-between bg-surface-container-lowest border-t md:border-t-0 md:border-l border-outline-variant/10">
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="w-10 h-10 bg-outline-variant/10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors absolute top-4 right-4 md:relative md:top-0 md:right-0 md:mb-4"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="space-y-2">
                  <span className="font-label text-[10px] font-extrabold uppercase tracking-widest text-[#10B981] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-[#10B981]" /> Now Playing
                  </span>
                  <h4 className="font-headline font-extrabold text-primary text-lg leading-tight">
                    {activeVideo.title}
                  </h4>
                </div>
                <p className="text-on-surface-variant font-body text-xs leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-outline-variant/10 mt-6">
                <div className="flex justify-between text-[11px] font-label text-on-surface-variant/60">
                  <span>{activeVideo.views}</span>
                  <span>{activeVideo.date}</span>
                </div>
                
                <a 
                  href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-primary text-white font-headline font-bold text-xs rounded-xl hover:bg-[#10B981] transition-colors shadow-sm"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
