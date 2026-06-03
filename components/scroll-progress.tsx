'use client';

import { useEffect, useState, useRef } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;
      
      if (totalScrollable > 0) {
        const currentProgress = (window.scrollY / totalScrollable) * 100;
        setProgress(currentProgress);
      } else {
        setProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial progress
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToPosition = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
    
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const targetScroll = percentage * (scrollHeight - clientHeight);
    
    window.scrollTo({
      top: targetScroll,
      behavior: isDragging.current ? 'auto' : 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle left clicks
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    handleScrollToPosition(e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      handleScrollToPosition(moveEvent.clientY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      setIsDraggingState(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={trackRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed right-0 top-0 bottom-0 z-[9999] hidden md:flex items-center justify-center cursor-pointer select-none transition-all duration-300 pointer-events-auto"
      style={{ 
        width: isHovered || isDraggingState ? '12px' : '6px',
      }}
      title="Scroll progress (Drag or click to navigate)"
    >
      {/* Scrollbar Track background */}
      <div className="absolute inset-0 bg-slate-200/20 dark:bg-white/[0.01] backdrop-blur-sm transition-all duration-300 border-l border-black/5 dark:border-white/5" />
      
      {/* Scrollbar Fill indicator */}
      <div 
        className="absolute top-0 right-0 left-0 bg-gradient-to-b from-emerald-500/60 via-accent to-emerald-400 rounded-b-full transition-all duration-75"
        style={{ height: `${progress}%` }}
      >
        {/* Glowing tip indicator */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent/80 blur-md pointer-events-none transition-opacity duration-300" />
        )}
      </div>
    </div>
  );
}
