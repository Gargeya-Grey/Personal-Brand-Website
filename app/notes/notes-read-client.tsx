'use client';

import { useEffect, useRef, useState } from 'react';
import { READ_CAP_SECONDS, READ_PING_SECONDS } from '@/lib/newsletter-model';

export function NotesReadProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };
    const schedule = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-slate-200/80 dark:bg-white/10" aria-hidden="true">
      <div
        className="h-full origin-left bg-emerald-600 transition-transform duration-75 ease-out dark:bg-emerald-400"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function NotesReadTracker({ issueId }: { issueId: string }) {
  const secondsRef = useRef(0);
  const sessionRef = useRef('');

  useEffect(() => {
    const key = `notes-read-${issueId}`;
    let session = '';
    try {
      session = sessionStorage.getItem(key) || '';
      if (!session) {
        session = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(key, session);
      }
    } catch {
      session = `${Date.now()}-tmp`;
    }
    sessionRef.current = session;

    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      secondsRef.current = Math.min(READ_CAP_SECONDS, secondsRef.current + READ_PING_SECONDS);
      const body = JSON.stringify({
        issueId,
        sessionId: sessionRef.current,
        seconds: secondsRef.current,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/newsletter/read', new Blob([body], { type: 'application/json' }));
        return;
      }
      void fetch('/api/newsletter/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    };

    const interval = window.setInterval(ping, READ_PING_SECONDS * 1000);
    ping();
    return () => window.clearInterval(interval);
  }, [issueId]);

  return null;
}
