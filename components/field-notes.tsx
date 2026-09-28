'use client';
import { useEffect, useRef } from 'react';

/** Content stays visible before JavaScript and when reduced motion is enabled. */
export function FieldMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.animate(
            [
              { opacity: 0.35, transform: 'translateY(16px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 600, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
          );
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    const stop = () => {
      if (preference.matches) {
        observer.disconnect();
        document
          .querySelectorAll('[data-reveal]')
          .forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
      }
    };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', stop);
    };
  }, []);
  return null;
}

export function CuriosityMark() {
  const mark = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (mark.current)
        mark.current.style.transform = preference.matches
          ? ''
          : `rotate(${Math.min(window.scrollY / 9, 100)}deg)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    preference.addEventListener('change', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      preference.removeEventListener('change', update);
    };
  }, []);
  return (
    <div ref={mark} className="curiosity-mark" aria-hidden="true">
      ✳
    </div>
  );
}
