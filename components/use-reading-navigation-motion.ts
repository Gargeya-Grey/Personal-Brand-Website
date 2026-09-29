'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/** Keep the reading controls attached to the navbar, including interrupted motion. */
export function useReadingNavigationMotion(
  navigationRef: RefObject<HTMLDivElement | null>,
  { enabled, hidden, routeKey }: { enabled: boolean; hidden: boolean; routeKey: string },
) {
  const hiddenRef = useRef(hidden);
  const synchronizeRef = useRef<(animate: boolean) => void>(() => {});

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    if (!enabled || !navigation) return;

    const sectionNav = document.querySelector<HTMLElement>('.reader-mobile-toc');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rootStyle = getComputedStyle(document.documentElement);
    const easing = rootStyle.getPropertyValue('--ease-out').trim();
    const durationToken = rootStyle.getPropertyValue('--default-transition-duration').trim();
    const duration = parseFloat(durationToken) * (durationToken.endsWith('ms') ? 1 : 1000);
    let navigationAnimation: Animation | undefined;
    let sectionAnimation: Animation | undefined;

    const synchronize = (animate: boolean) => {
      const navigationTop = navigation.getBoundingClientRect().top;
      const sectionTop = sectionNav?.getBoundingClientRect().top;
      const navigationStyle = getComputedStyle(navigation);
      const inset = parseFloat(navigationStyle.top);
      const travel = inset + navigation.offsetHeight;
      const targetTranslation = hiddenRef.current ? -travel : 0;

      // Sample the current painted position before cancelling an interrupted move.
      navigationAnimation?.cancel();
      sectionAnimation?.cancel();
      navigation.style.transform = `translateY(${targetTranslation}px)`;
      if (sectionNav) {
        sectionNav.style.top = hiddenRef.current
          ? 'max(8px, env(safe-area-inset-top))'
          : `${travel + 8}px`;
      }

      if (!animate || reducedMotion.matches) return;
      const fromTranslation = navigationTop - inset;
      const distance = Math.abs(fromTranslation - targetTranslation);
      if (distance < 0.5) return;
      const timing: KeyframeAnimationOptions = {
        duration: duration * Math.min(1, distance / travel),
        easing,
      };
      navigationAnimation = navigation.animate([
        { transform: `translateY(${fromTranslation}px)` },
        { transform: `translateY(${targetTranslation}px)` },
      ], timing);

      if (sectionNav && sectionTop !== undefined && getComputedStyle(sectionNav).display !== 'none') {
        // Change the sticky inset once, then bridge that change using transform.
        // In normal document flow the inset changes no position, so nothing moves.
        const delta = sectionTop - sectionNav.getBoundingClientRect().top;
        if (Math.abs(delta) >= 0.5) {
          sectionAnimation = sectionNav.animate([
            { transform: `translateY(${delta}px)` },
            { transform: 'translateY(0)' },
          ], timing);
        }
      }
    };

    synchronizeRef.current = synchronize;
    synchronize(false);
    let lastHeight = navigation.offsetHeight;
    const observer = new ResizeObserver(() => {
      if (navigation.offsetHeight === lastHeight) return;
      lastHeight = navigation.offsetHeight;
      synchronize(false);
    });
    observer.observe(navigation);
    const onResize = () => synchronize(false);
    window.addEventListener('resize', onResize);
    reducedMotion.addEventListener('change', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      reducedMotion.removeEventListener('change', onResize);
      navigationAnimation?.cancel();
      sectionAnimation?.cancel();
      navigation.style.removeProperty('transform');
      sectionNav?.style.removeProperty('top');
      synchronizeRef.current = () => {};
    };
  }, [enabled, navigationRef, routeKey]);

  useLayoutEffect(() => {
    hiddenRef.current = hidden;
    synchronizeRef.current(true);
  }, [enabled, hidden, routeKey]);
}
