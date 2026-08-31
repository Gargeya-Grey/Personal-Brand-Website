'use client';

import { useEffect, useRef } from 'react';
import { READ_CAP_SECONDS, READ_PING_SECONDS } from '@/lib/newsletter-model';

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
